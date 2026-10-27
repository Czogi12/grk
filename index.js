import http from "http";
import fs from "fs"
import path from "path"

const server = http.createServer(async (req, res) => {
    try {
        const { url } = req;
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