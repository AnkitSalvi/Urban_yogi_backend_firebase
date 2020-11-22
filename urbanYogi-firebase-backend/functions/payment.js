const {v4:uuid4} =require('uuid');
const stripe = require("stripe")("sk_test_ZLn2Zl9F4yOlCABQ9OdjwuA200qjgcNgNi");

const db = require('./firebase-init.js')

module.exports = (app) => {
    
    app.post("/payment",async(req,res)=>{
        
      const {body, uidCoach, uidClient, classID, duration, className, coachName, coachLastName, amount} = req.body;
      
      console.log(uidCoach)
      console.log(uidClient)

      const idempotencyKey = uuid4()
      const line1 = '510 Townsend St';
      const country = body.token.card.country;
      const email = body.token.email;

      console.log("befor charge")
      const customer =  await stripe.customers.create({
            email: email,
            source:body.token.id,
            name: body.token.card.name,
            address: {
              line1: line1,
              city: body.token.card.city,
              state: body.token.card.state,
              country: country,
            }
      })

      console.log("after charge")


      const charge =  await stripe.charges.create(
        {
          amount: amount * 100,
          currency: 'usd',
          customer: customer.id,
          receipt_email: body.token.email,
          description: 'purchase of ${product.name}',
          shipping: {
            name: body.token.card.name,
            address:{
                  line1: body.token.card.address_line1,
                  line2: body.token.card.address_line2,
                  city: body.token.card.address_city,
                  state: body.token.card.address_state,
                  country: body.token.card.address_country
                              
            }
          }
        }, 
        {
          idempotencyKey
        });

  
  

  if(charge.status==="succeeded"){
      await db.collection('stripe_one_time_payment').doc().set({
        customer_id: charge.customer,
        email: email,
        type:"oneTimePayment",
        status:charge.status,
        uidCoach:uidCoach,
        uidClient:uidClient,
        duration:duration,
        className:className,
        coachName:coachName,
        coachLastName:coachLastName,
        price:amount
      });



      //setting clients stats collection
let docIDCoachClient = uidCoach+uidClient

const docPath = await (db.collection('clients_stats').doc(docIDCoachClient));


    return db.runTransaction(function(transaction){
      return transaction.get(docPath).then(function(doc){
        if(!doc.exists){        
          console.log("yoooo")
          const snap = ( db.collection(`clients_stats`).doc(docIDCoachClient)).set({
            clientUid: uidClient,
            coachUid: uidCoach,
            contribution:0,
            subscription:0,
            dropins:amount,
            attendedCount:0,
            lastAttended:"",
            bookedCount:0
          },{merge:true})
        }
        else{
          console.log("yayyay")
          var newDropIn = doc.data().dropins+amount
          transaction.update(docPath, {dropins:newDropIn});
        }
        return;
      });

    }).then(function(){
      console.log("transaction successful")
      res.json({'charge': charge, 'paymentStatus': charge.status});
      return;
    })
    .catch(function(error){
      console.log(error)
      throw(error)
    })


  }

    
    

    });


  }