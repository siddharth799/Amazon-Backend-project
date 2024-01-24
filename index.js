import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";


const app = express();
const port = 5000;
const saltRounds = 10;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "register",
  password: "123xyz",    //<== enter your password database password here 
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req,res) => {
  res.render("register.ejs");
});

app.post("/register", async (req,res) =>{
  const name= req.body.username;
  const email =req.body.useremail;
  const password=req.body.userpassword;   
  try{
      const checkResult =await db.query("SELECT * FROM users WHERE email =$1" , [
        email,
      ]);
        
      if(checkResult.rows.length > 0){
        res.render("alreadydone.ejs");
      }else{

        bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          await db.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
            [name, email, hash]
          );
          res.render("welcome.ejs");          
        }
      });
      }
  }catch(err){
    console.log(err);
  }
  
});

app.post("/", async (req,res)=> {
  const email =req.body.useremail;
  const loginPassword = req.body.userpassword;
  try{
    const result =await db.query("SELECT * FROM users WHERE email = $1",[
      email,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;
      bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          if (result) {
            res.render("welcome.ejs");
          } else {
            res.render("error.ejs");
          }
        }
      });
    } else {
      res.render("usernotexist.ejs");
    }
  }catch(err){
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
