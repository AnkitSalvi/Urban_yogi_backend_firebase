    const stripe = require("stripe")("sk_test_ZLn2Zl9F4yOlCABQ9OdjwuA200qjgcNgNi");



const functions = require('firebase-functions');

const db = require('./firebase-init.js')


module.exports = (app) => {
    
  app.post('/createPrice', async (req, res) => {
    console.log("folololol");
    const {productName, productPrice, uidCoach, recurring} = req.body;
    console.log("lolololol");

  const product = await stripe.products.create({
      name: productName,
  }); 
 
 const price = await stripe.prices.create({
   product: product.id,
   unit_amount: productPrice,
   currency: 'inr',
   recurring: {
     interval: recurring,
   },
 });

 console.log(price)

 if(recurring==="week"){
    await db.collection('subscription_plans').doc(uidCoach).set({
    priceWeek:price,
  },{merge:true});
 }

if(recurring === "month"){
    await db.collection('subscription_plans').doc(uidCoach).set({
    priceMonth:price,
  },{merge:true});
 }




 res.send(price);
 
  })



app.post('/sub', async (req, res) => {
  const {email, payment_method, uidClient, uidCoach, priceID, recurring} = req.body;

// const product = await stripe.products.create({
//       name: "productName",
//   }); 
 
//  const price = await stripe.prices.create({
//    product: product.id,
//    unit_amount: 40000,
//    currency: 'inr',
//    recurring: {
//      interval: 'day',
//    },
//  });



const customer = await stripe.customers.create({
  name:'ankit',
  payment_method: payment_method,
  email: email,
  invoice_settings: {
    default_payment_method: payment_method,
  },
  address:{
    line1: 'house1',
    line2: 'house2',
    city: 'india',
    state: 'rajasthan',
    country: 'india'
                
  }
});


const subscription = await stripe.subscriptions.create({
  customer: customer.id,
  items: [{ plan: priceID }],
  expand: ['latest_invoice.payment_intent'],
  
});

console.log(new Date(subscription.current_period_end*1000))
console.log(new Date(subscription.current_period_start*1000))
// console.log(subscription['latest_invoice'].total)
// console.log(subscription)


if(subscription['latest_invoice']['status']==="paid"){

 await db.collection('stripe_subscription').doc().set({
    customer_id: customer.id,
    subscriptionID: subscription['latest_invoice']['subscription'],
    status: subscription['latest_invoice']['status'],
    email: customer.email,
    type:"subscription",
    uidClient:uidClient,
    uidCoach:uidCoach,
    exipresOn:new Date(subscription.current_period_end*1000),
    amount:subscription['latest_invoice'].total,
    recurring:recurring
  });




 //setting clients stats collection
let docIDCoachClient = uidCoach+uidClient

const docPath = await (db.collection('clients_stats').doc(docIDCoachClient));


     db.runTransaction(function(transaction){
      return transaction.get(docPath).then(function(doc){
        if(!doc.exists){        
          console.log("yoooo")
          const snap = ( db.collection(`clients_stats`).doc(docIDCoachClient)).set({
            clientUid: uidClient,
            coachUid: uidCoach,
            contribution:0,
            subscription:subscription['latest_invoice'].total,
            dropins:amount,
            attendedCount:0,
            lastAttended:"",
            bookedCount:0
          },{merge:true})
        }
        else{
          var newSubscription = doc.data().subscription+subscription['latest_invoice'].total;
          transaction.update(docPath, {subscription:newSubscription});
        }
        return;
      });

    }).then(function(){
      console.log("transaction successful")
      res.json({'subscriptionID': subscription['latest_invoice']['subscription'], 'status': subscription['latest_invoice']['status']});
      return;
    })
    .catch(function(error){
      console.log(error)
      throw(error)
    })


}






});

}
