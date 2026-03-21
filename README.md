# Despliegue en S3

Estas son las instrucciones para desplegar el frontend en un bucket S3.

## Prerrequisitos

- Node.js y npm instalados.
- AWS CLI configurado con credenciales y región (`aws configure`).
- Bucket S3 creado.

## Build

Genera el build de producción (salida en `dist/fuse`):

```bash
npm ci
npm run build:prod
```

Si necesitas QA (salida en `dist/qa`):

```bash
npm run build:qa
```

## Configuración del bucket

Habilita **Static website hosting** y configura:

- Index document: `index.html`
- Error document: `index.html` (para rutas SPA)

## Subida a S3

# PROD:

```bash
aws s3 sync dist/fuse/browser s3://strategy-angular-prod --delete
```

# QA:

```bash
aws s3 sync dist/qa/browser s3://strategy-angular-qa --delete
```

## Cache recomendado (opcional)

Si usas cache agresivo, actualiza `index.html` con no-cache y deja los assets con cache largo:

# PROD:
```bash
aws s3 cp dist/fuse/browser/index.html s3://strategy-angular-prod/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"
```
# QA:
```bash
aws s3 cp dist/qa/browser/index.html s3://strategy-angular-qa/index.html --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"
```
