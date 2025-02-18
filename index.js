import express from "express"

const app = express()

app.use(express.json())

app.post("/201", (req, res) => {
  console.log('headers', req.headers)
  console.log('body', req.body)
  
  return res.status(201).send({
    sucefule: "sucesso 201"
  })
})

app.get("/400", (req, res) => {
  return res.status(400).send({
    description: "erro 400"
  })
})

app.get("/401", (req, res) => {
  return res.status(401).send({
    description: "erro 401"
  })
})

app.get("/403", (req, res) => {
  return res.status(403).send({
    description: "erro 403"
  })
})

app.get("/500/v1", (req, res) => {
  return res.status(500).send({
    description: "internal server error"
  })
})

app.get("/500/v2", (req, res) => {
  return res.sendStatus(500)
})

app.listen(3333, () => {
  console.log("Server is running on port 3333")
})