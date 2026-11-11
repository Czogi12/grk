import http from "http";
import fs from "fs"
import path from "path"

const server = http.createServer(async (req, res) => {
    try {
        const { url } = req;
        console.log(url)
        switch (url.slice(1)) {
            case "":
                const html = fs.readFileSync(path.join(import.meta.dirname, "public", "index.html"));
                res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                res.end(html);
            break;
            case "MP2":
                console.log("entering MP2")
                break;
            default:
                const step = url.match(/^\/(MP\d+)\/([\d-]+)$/);
                if (step) {
                    const [, mp, nr] = step;
                    const script = `/${mp}/${mp}_s27023_${nr}.js`;
                    console.log(script)
                    if (fs.existsSync(path.join(import.meta.dirname, script))) {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                        res.end(`<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>${mp} ${nr}</title>
    <script type="module" src="${script}"></script>
</head>
<body></body>
</html>`);
                        return;
                    }
                }
                if (/^\/MP\d+\/[\w-]+\.js$/.test(url)) {
                    const js = fs.readFileSync(path.join(import.meta.dirname, url));
                    res.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
                    res.end(js);
                    return;
                }
                if (url.endsWith(".css")) {
                    const style = fs.readFileSync(path.join(import.meta.dirname, "public", url));
                    if (style) {
                        res.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
                        res.end(style);
                        return;
                    }
                }
                res.statusCode = 301;
                res.setHeader("Location", "/");
                res.end();
            break;
        }
    } catch (error) {
        res.writeHead(500);
        console.error(error);
        res.end("Error during handling the request.");         
    }
});

server.listen(3000, 'localhost', () => {console.log("SERVER RUNNING");});