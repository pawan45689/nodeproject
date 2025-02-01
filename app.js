const express=require('express')
const app=express()
const router=express.Router()
app.use(express.static('views'));
app.use(express.static('upload'));
app.set('view engine','ejs');
const bodyparser = require('body-parser');
const userschema = require('./model/userschema') //import register schema
const noadmailer = require('nodemailer')
const config = require('./db/config.env')
const crypto = require('crypto');
const multer= require("multer");
const {v4:uuidv4} = require("uuid")
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
const contactModel = require('./model/contactschema') //import cintact schemma
const ProductModel = require('./model/productschema')
const session = require('express-session');
const cookies = require('cookie-parser');
app.use(cookies());
app.use(session({
    key:"user_sid",
    secret:SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie:{
        expires:1000000,
    },
}));


const validateUserSession = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        next();
    } else {
        res.redirect('/');
    }
};

router.get('/',async(req,res)=>{
    try{

       
        const viewproductdata = await ProductModel.find({});
        res.render('index',{viewproductdata: viewproductdata});
        console.log(viewproductdata);
       
   }
       catch(err){
       console.log(err);
        
       }
    });


 
router.get('/shop',function(req,res){
    res.render('shop');
})
router.get('/dashboard',validateUserSession, async (req,res)=>{
            res.render('dashboard/index');   
  
})
//data of addproduct in dashboard
router.get('/addproduct',  validateUserSession,async (req,res)=>{
        res.render('dashboard/add')  
})
//fileuploading
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./upload');
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
        //cb(null,uuidv4()+'-'+Date.now()+path.extname(file.originalanme))
    }
});

const fileFilter=(req,file,cb)=>{
    const allowedFileTypes=['image/jpeg','image/jpg','img/webp','img/png'];
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null,true);
    }
    else{
        cb(null,false);
    }
}
let upload= multer({storage,fileFilter, limits: { fileSize: 2 * 1024 * 1024 },});
router.post('/addproduct',upload.single('image'),(req,res)=>{
    var addproduct ={
       Category: req.body.category,
        Product: req.body.product,
        Price:req.body.price,
        image: req.file.filename, 
    };
    var regpost = new ProductModel(addproduct);
    regpost.save()

    .then(()=>
    res.json('add successfully'))
    .catch(err=> res.status(400).json('error:' +err));
});
//viwe product data list
router.get('/viewproduct',validateUserSession, async (req,res) =>{
    try{

       
     const viewproductdata = await ProductModel.find({});
     res.render('dashboard/viewproduct',{viewproductdata: viewproductdata});
     console.log(viewproductdata);
    
}
    catch(err){
    console.log(err);
     
    }
 });


//delete api for viewproduct
router.get("/delete_1/:id", async(req, res) => {
    try{
        const viewproduct= await ProductModel.findByIdAndDelete
        (req.params.id);
        res.redirect('/viewproduct');
    }
    catch (err){
        console.log(err);
    }
})
//edit api for editproduct
router.get('/edit_1/:id', async (req, res)=>{
    try{
        const productedit = await ProductModel.findById(req.params.id);
        res.render('dashboard/edit-product', { productedit: productedit })
        console.log(productedit);
    }
    catch(err){
        console.log(err)
    }
})
//update
router.post('/edit_1/:id', async (req,res)=>{
    const itemId = req.params.id;
    const updatedData = {
        Category: req.body. category,
        Product: req.body. product,
        Price: req.body. price,
      Image:req.body.image,
     

    }
    try{
        const updatedItem = await ProductModel.findByIdAndUpdate(itemId,updatedData)
        if(!updatedItem){
            return res.status(404).json({message:'itemn not found'});
        }
        res.redirect('../viewproduct');

    } 
    catch(err){
        res.status(500).json({message:'server error'});
    }
})
 
//schema
router.get('/contact',function(req,res){
    res.render('contact');
})
//contact data
router.post('/contact',(req,res)=>{
    var contact ={
        Name: req.body.name,
       Email: req.body.email,
        Number: req.body.number,
        Message: req.body.message

    };
    var regpost = new contactModel(contact);
    regpost.save()
    .then(()=>
    res.json('message successfully'))
    .catch(err=> res.status(400).json('error:' +err));
});

//data of view contact in dashboard

router.get('/viewcontact', validateUserSession, async (req,res)=>{
   try{
    const contactdata = await contactModel.find({});
    res.render('dashboard/viewcontact',{contactdata: contactdata});
    console.log(contactdata)
   }
   catch(err){
    console.log(err);
   }
   
})
//delete api for contact
router.get("/delete_2/:id", async(req,res)=>{
    try{
        const viewcontact = await contactModel.findByIdAndDelete
        (req.params.id);
        res.redirect('/viewcontact');
    }
    catch (err){
        console.log(err);
    }
})
//edit api for contact
router.get('/edit_2/:id', async (req, res)=>{
    try{
        const contactedit = await contactModel.findById(req.params.id);
        res.render('dashboard/edit-contact', { contactedit: contactedit })
        console.log(contactedit);
    }
    catch(err){
        console.log(err)
    }
})

//update api for contact
router.post('/edit_2/:id', async (req,res)=>{
    const itemId = req.params.id;
    const updatedData = {
        Name: req.body.name,
        Email: req.body.email,
      Number: req.body.number,
      Message:req.body.message

    }
    try{
        const updatedItem = await contactModel.findByIdAndUpdate(itemId,updatedData)
        if(!updatedItem){
            return res.status(404).json({message:'itemn not found'});
        }
        res.redirect('../viewcontact');

    } 
    catch(err){
        res.status(500).json({message:'server error'});
    }
})

//cerataccount  schema
router.get('/creataccount',function(req,res){
    res.render('creat');
    
})
router.post('/register',(req,res)=>{
    var register ={
        Name: req.body.name,
        Phone: req.body.phone,
        Email: req.body.email,
        Password: req.body.password

    };
    var regpost = new userschema(register);
    regpost.save()
    .then(()=>
    res.json('register successfully'))
    .catch(err=> res.status(400).json('error:' +err));
});
//dashboard view register 
router.get('/viewregister', validateUserSession,async (req,res) =>{
    try{
     const userdata = await userschema.find({});
     res.render('dashboard/viewregister',{userdata: userdata});
     console.log(userdata);
    }
    catch(err){
    console.log(err);
     
    }
 });
 //delete api for registetion
router.get("/delete/:id", async (req, res) => {
    try {
        const userdelete = await  userschema.findByIdAndDelete
        (req.params.id);
        res.redirect('../viewregister');  
    } catch (err) {
        console.log(err);
        
    }
});

  
//api for edit register
router.get('/edit/:id', async (req, res)=>{
    try{
        const useredit = await userschema.findById(req.params.id);
        res.render('dashboard/edit-register', { useredit: useredit })
        console.log(useredit);
    }
    catch(err){
        console.log(err)
    }
})

//update api for register
router.post('/edit/:id', async (req,res)=>{
    const itemId = req.params.id;
    const updatedData = {
        Name: req.body.name,
        Phone: req.body.phone,
        Email: req.body.email,
        Password:req.body.password

    }
    try{
        const updatedItem = await userschema.findByIdAndUpdate(itemId,updatedData)
        if(!updatedItem){
            return res.status(404).json({message:'itemn not found'});
        }
        res.redirect('../viewregister');  
    } 
    catch(err){
        res.status(500).json({message:'server error'});
    }
})
router.get('/login',function(req,res){
    res.render('login');

})
//login page
router.post('/login', async (req, res) => {
    var Email = req.body.email;
    var Password = req.body.password;
    
    try {
        var user = await userschema.findOne({ Email: Email }).exec();
        if (!user) {
            return res.redirect('/login'); 
        }
        
     
        user.comparePassword(Password, (error, match) => {
            if (!match) {
                return res.redirect('/login'); 
            }
            
            //  session
            req.session.user = user;

            
            if (user.role === 1) {
                return res.redirect('/dashboard');
            } else {
                return res.redirect('/'); 
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get("/logout",(req,res)=>{
    if(req.session.user && req.cookies.user_sid){
        res.clearCookie("user_sid");
        res.redirect("/login")
    }else{
        res.redirect("/");
    }
})
//details
router.get('/detail/:id', async (req, res) => {
    try {
        const product = await ProductModel.findById(req.params.id);
        res.render('detail', { product: product }); 
        console.log(product);
    } catch (err) {
        console.log(err);
    }
});

//forgotpassword
router.get('/forgotpassword', function(req,res){
res.render('forgotpassword')
})

//fruit
router.get('/fruit',function(req,res){
    res.render('fruit');

})
//vegitable
router.get('/veg',function(req,res){
    res.render('veg');

})
//sanks
router.get('/snacks',function(req,res){
    res.render('snacks');

})
//beverag
router.get('/beverage',function(req,res){
    res.render('beverage');

})
router.get('/dairy',function(req,res){
    res.render('dairy');

})
app.use('/',router);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });