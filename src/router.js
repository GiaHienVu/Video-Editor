const User = require('./controllers/user')



module.exports = (sever) =>{
   sever.route("get", "/index.html", () =>{
            console.log("Something");

   });


    sever.route("get", "/", User.logUser);

    sever.route("get", "/style.css", () =>{
        console.log("Something");
    });


}