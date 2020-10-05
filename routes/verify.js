const jwt = require("jsonwebtoken");

const verifier = (req, res, next) => {

  const token = req.header("auth-token");

  if(!token){

    res.status(401).send("Access denied");
  }

  else{
    try{

      const verified = jwt.verify(token, "sadpgdajgoifdgiosdgö234324");
      req.user = verified;
      next();
    }

    catch(err){

      // Failed to verify the jwt token.
      res.status(400).send("Token is invalid");
    }
  }
}

module.exports = verifier;
