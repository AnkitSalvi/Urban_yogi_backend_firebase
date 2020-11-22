const nodemailer = require('nodemailer'); 

const ical = require('ical-generator');

var moment = require('moment');

module.exports = (app) => {   
    app.get('/mail',(req,res)=>{

        const cal = ical({domain: '', name: ''});
 
        // overwrite domain
       // cal.domain('sebbo.net');
        console.log("faaaaaaaaaaaaaaaaakkkkk");
        cal.createEvent({
            start: moment(),
            end: moment().add(1, 'hour'),
            summary: 'Urban yogi',
            description: 'It works ;)',
            location: '',
            url: 'https://www.youtube.com/watch?v=nRwbp2QVj5Y'
        });

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
              user: 'mohan14111995@gmail.com',
              pass: 'htqpynrpcekypkzk'
            },
            tls: {
                rejectUnauthorized: false
            }
          });
          
          var mailOptions = {
            from: 'mohan14111995@gmail.com',
            to: 'ankitsalvi233@gmail.com',
            subject: 'calender invite',
            text: 'invite'
          };

          if (cal) {
            let alternatives = {
                "Content-Type": "text/calendar",
                "method": "REQUEST",
                "content": new Buffer(cal.toString()),
                "component": "VEVENT",
                "Content-Class": "urn:content-classes:calendarmessage"
            }
            
            mailOptions['alternatives'] = alternatives;
            mailOptions['alternatives']['contentType'] = 'text/calendar'
            mailOptions['alternatives']['content'] 
            = new Buffer(cal.toString())
    }
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.send("error" + error);
            } else {
              console.log('Email sent: ' + info.response);
              res.send(info.response);
            }
          }); 
 
    });
  }




