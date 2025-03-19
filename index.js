import http from "http"
import fs from 'fs'
import crypto from "crypto"
import path from "path"
import "dotenv/config"


const PORT = 3000
const DATA_FILE = path.join("data","links.json")

const serveFile = async (res, filePath, contentType) => {
    try {
        const data = await fs.promises.readFile(filePath)
        res.writeHead(200, { "Content-Type": contentType })
        res.end(data)
    } catch (error) {
        res.writeHead(404, { "Content-Type": contentType })
        res.end("404 , Page not found")
    }
}


const loadlinks = async () => {
    try {
        const data = await fs.promises.readFile(DATA_FILE ,"utf-8")
        return JSON.parse(data)
    } catch (error) {
        if(error.code === "ENOENT"){
            await fs.promises.writeFile(DATA_FILE,JSON.stringify({}))
            return {}
        }
        throw error
    }
}

const saveLinks=async(links)=>{
    await fs.promises.writeFile(DATA_FILE,JSON.stringify(links))
}

const server = http.createServer(async (req, res) => {

const links = await loadlinks()

    if (req.method === "GET") {
        if (req.url === "/") {
            return serveFile(res, path.join("public", "index.html"), "text/html")
        }
        else if (req.url === "/style.css") {
            return serveFile(res, path.join("public", "style.css"), "text/css")
        }
        else if (req.url === "/script.js") { 
            return serveFile(res, path.join("public", "script.js"), "text/javascript");
        }
        else if(req.url==="/links"){
            const links = await loadlinks()
            res.writeHead(200,{"Content-Type":"application/json"})
            return res.end(JSON.stringify(links))
        }
        else{
            const links = await loadlinks()
            const shortCode = req.url.slice(1)

            if(links[shortCode]){
                res.writeHead(302, {location : links[shortCode]})
                return res.end()
            }

            res.writeHead(404, {"Content-Type":"text/plain"})
            return res.end("Shortened URL not found")
        }
    }
    


    if(req.method==="POST" && req.url==="/shorten"){
        let body =""
        req.on("data",(chunk)=>{
            body+=chunk
        })
        req.on("end",async()=>{
            const {url , shortCode} = JSON.parse(body)

            if(!url){
                res.writeHead(400,{"Content-Type":"text/plain"})
                return res.end("URL is required")
            }

            const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex")

            if(links[finalShortCode]){
                res.writeHead(400,{"Content-Type":"application/json"})
                return res.end("URL already exists")
            }
        
            links[finalShortCode]=url
            await saveLinks(links)
        
            res.writeHead(200,{"Content-Type":"text/plain"})
            res.end(JSON.stringify({success:true , shortCode:finalShortCode}))
        })

        return
    }


})

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})