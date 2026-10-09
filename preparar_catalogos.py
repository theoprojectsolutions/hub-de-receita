"""Extrai textos de PDFs de um ZIP sem modificar o original.
Instalar: py -m pip install pypdf
Usar: py preparar_catalogos.py "F:\\catálogos.zip"
Só algumas marcas: py preparar_catalogos.py "F:\\catálogos.zip" --filtro meltpower parker gates nitta mectrol
Pular o que já foi enviado: --pular tuder tudertechnica walther kanaflex himaflex orion
"""
import argparse
import csv
import hashlib
import tempfile
import zipfile
from pathlib import Path
from pypdf import PdfReader

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('zip', type=Path)
    parser.add_argument('--saida', type=Path, default=Path.cwd() / 'catalogos_para_claude')
    parser.add_argument('--filtro', nargs='*', default=[], help='Palavras no caminho do PDF (pasta ou nome); basta uma bater')
    parser.add_argument('--pular', nargs='*', default=[], help='Palavras no caminho do PDF que devem ser ignoradas')
    parser.add_argument('--limite', type=int, default=0, help='Quantidade de PDFs para teste; 0 = todos')
    args = parser.parse_args()
    args.saida.mkdir(parents=True, exist_ok=True)
    dest = Path(tempfile.mkdtemp(prefix='lote_', dir=args.saida))
    max_bytes = 2_000_000
    part = 0
    size = 0
    stream = None

    def write(text):
        nonlocal part, size, stream
        # Corte por caracteres, com blocos cujo UTF-8 cabe em 2 MB.
        while text:
            chunk, text = text[:200_000], text[200_000:]
            payload = chunk.encode('utf-8')
            if stream is None or size + len(payload) > max_bytes:
                if stream:
                    stream.close()
                part += 1
                stream = (dest / f'catalogos_texto_{part:04d}.txt').open('wb')
                size = 0
            stream.write(payload)
            size += len(payload)

    seen = {}
    processed = 0
    try:
        with zipfile.ZipFile(args.zip) as archive, \
             (dest / 'indice.csv').open('w', encoding='utf-8-sig', newline='') as index_file, \
             (dest / 'paginas_sem_texto.csv').open('w', encoding='utf-8-sig', newline='') as pending_file:
            index = csv.writer(index_file)
            pending = csv.writer(pending_file)
            index.writerow(['arquivo_original', 'status', 'paginas', 'paginas_sem_texto', 'copia_de', 'erro'])
            pending.writerow(['arquivo_original', 'pagina', 'motivo'])
            candidates = [entry for entry in archive.infolist()
                          if entry.filename.lower().endswith('.pdf')
                          and not Path(entry.filename).name.startswith('._')
                          and (not args.filtro or any(f.lower() in entry.filename.lower() for f in args.filtro))
                          and not any(f.lower() in entry.filename.lower() for f in args.pular)]
            print(f'{len(candidates)} PDFs selecionados', flush=True)
            for entry in candidates:
                if args.limite and processed >= args.limite:
                    break
                processed += 1
                print(f'[{processed}/{len(candidates)}] {entry.filename}', flush=True)
                pages = 0
                missing = 0
                try:
                    # Um PDF por vez em arquivo temporário, sem extrair caminhos do ZIP.
                    with tempfile.TemporaryDirectory() as temp:
                        path = Path(temp) / 'entrada.pdf'
                        digest = hashlib.sha256()
                        with archive.open(entry) as source, path.open('wb') as target:
                            while block := source.read(1024 * 1024):
                                digest.update(block)
                                target.write(block)
                        key = digest.hexdigest()
                        if key in seen:
                            index.writerow([entry.filename, 'duplicado', '', '', seen[key], ''])
                            continue
                        with path.open('rb') as pdf_file:
                            doc = PdfReader(pdf_file)
                            if doc.is_encrypted:
                                raise ValueError('PDF protegido por senha')
                            pages = len(doc.pages)
                            for n, page in enumerate(doc.pages, 1):
                                text = (page.extract_text() or '').strip()
                                header = f'\n\n=== ARQUIVO: {entry.filename} | PAGINA: {n} ===\n'
                                if not text:
                                    missing += 1
                                    pending.writerow([entry.filename, n, 'Sem texto extraivel; verificar imagem/OCR'])
                                    text = '[PAGINA SEM TEXTO EXTRAIVEL: CONFERIR PDF ORIGINAL]'
                                write(header + text + '\n')
                        seen[key] = entry.filename
                        index.writerow([entry.filename, 'extraido', pages, missing, '', ''])
                except Exception as exc:
                    index.writerow([entry.filename, 'erro', pages, missing, '', str(exc)])
                index_file.flush()
                pending_file.flush()
    finally:
        if stream:
            stream.close()
    (dest / 'LEIA-ME.txt').write_text(
        'Envie indice.csv primeiro e selecione os catalogos relevantes.\n'
        'Os arquivos catalogos_texto_*.txt contem texto com arquivo e pagina de origem.\n'
        'O tamanho de cada parte e limitado a 2 MB; a janela de contexto do Claude ainda se aplica.\n'
        'Imagens, desenhos e layout nao foram preservados. Tabelas podem perder alinhamento.\n'
        'Consulte paginas_sem_texto.csv para paginas que precisam de revisao/OCR.\n'
        'Consulte indice.csv para duplicados e erros. Arquivos que nao sejam PDFs nao foram convertidos.\n'
        'O ZIP original permanece intacto.\n', encoding='utf-8')
    print(f'Concluido: {dest.resolve()}')

if __name__ == '__main__':
    main()
