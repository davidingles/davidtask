el video es: https://www.youtube.com/watch?v=tjqrtXU3V6M&t=3372s

para instalar el bin el comando de consola es:

```bash
npm link
```

para desinstalarlo es:
```bash
npm unlink
```

para que funciones hay que añadir el `'shebang'` en el 
index.js
```bash
#!/usr/bin/env node
```

y el objeto en el package.json:
```bash
  "bin": {
    "task": "./task.cli.2/index.js"
  }
```
