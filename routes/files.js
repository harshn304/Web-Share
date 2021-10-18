const router = require('express').Router();
const multer = require('multer');
const path =  require('path');
const File = require('../models/file');
const {v4 : uuid4} = require('uuid');

let storage =multer.diskStorage({
    destination : (req , file,cb) => cb(null,'uploads/'),
    filename : (req ,file ,cb ) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    } 
})

let upload = multer({
    storage,
    limit: {fileSize : 1000000 * 100},
}).single('myfile');

router.post('/',(req,res)=>{

//store files
    upload(req,res ,async (err)=>{
        // validate req
        if(!req.file){
            return res.json({error : "All field are required."});
        }

        if(err){
            return res.status(500).send({err: err.message})
        }
        //store into db
        const file = new File({
            filename : req.file.filename,
            uuid : uuid4() ,
            path : req.file.path,
            size : req.file.size
        });
        const response = await file.save();
        return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`});
    });
//response -> link
});

router.post('/send',async(req,res)=>{
    const { uuid , emailTo , emailFrom} = req.body;
    // validate req
    if(!uuid || !emailTo || !emailFrom)
    {
        return res.status(422).send({ error : "all field are required"});
    }
    // fetch data from database
    const file = await File.findOne({uuid: uuid});
    if(file.sender){
        return res.status(422).send({ error : "Email alredy sent"});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    const sendMail = require('../services/emailServices');
    sendMail({
        from : emailFrom,
        to: emailTo,
        subject : "Web share",
        text : `${emailFrom} shared file with you..!`,
        html : require('../services/emailTemplate')({
            emailFrom : emailFrom,
            downloadlink : `${process.env.APP_BASE_URL}/files/${file.uuid}`,
            size : parseInt(file.size/1000) + ' KB',
            expire : '24 Hours'
        })
    });
    return res.send({ success : true });

});

module.exports = router;