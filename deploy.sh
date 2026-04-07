#!/bin/bash
# Deploy Sofia React → Flask container
# Uso: ./deploy.sh

set -e

echo "Building React..."
npm run build

echo "Copying assets..."
rm -f /mnt/projetos/sofia-web/static/react-assets/*.js /mnt/projetos/sofia-web/static/react-assets/*.css
mkdir -p /mnt/projetos/sofia-web/static/react-assets
cp dist/assets/* /mnt/projetos/sofia-web/static/react-assets/

# Extrair nomes dos assets do index.html gerado
JS_FILE=$(grep -oP 'src="/assets/\K[^"]+' dist/index.html)
CSS_FILE=$(grep -oP 'href="/assets/\K[^"]+' dist/index.html)

echo "Updating template (JS: $JS_FILE, CSS: $CSS_FILE)..."
cat > /mnt/projetos/sofia-web/templates/index.html << EOF
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/static/icon-192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Sofia LiberNet - Inteligência descentralizada. Liberdade conectada." />
    <title>Sofia LiberNet - IA Autônoma</title>
    <script type="module" crossorigin src="/static/react-assets/$JS_FILE"></script>
    <link rel="stylesheet" crossorigin href="/static/react-assets/$CSS_FILE">
  </head>
  <body class="bg-black text-slate-50">
    <div id="root"></div>
  </body>
</html>
EOF

echo "Restarting container..."
docker restart sofia-web

echo "Done! sofia.libernet.app updated."
