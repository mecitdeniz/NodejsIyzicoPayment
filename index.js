const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser')

const Iyzipay = require('iyzipay');

//Initialize Iyzipay
const iyzipay = new Iyzipay({
    apiKey: 'sandbox-uhanfVd47M9da1aSBXgBqDVVrbmdzdC1',
    secretKey: 'sandbox-OHR4BLsGSdOH2Yo5PFTEFHLtZdZD9fDe',
    uri: 'https://sandbox-api.iyzipay.com'
});

const BasketItems = [
    {
        id: 'BI101',
        name: 'Binocular',
        category1: 'Collectibles',
        category2: 'Accessories',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: '0.3'
    },
    {
        id: 'BI102',
        name: 'Game code',
        category1: 'Game',
        category2: 'Online Game Items',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: '0.5'
    },
    {
        id: 'BI103',
        name: 'Usb',
        category1: 'Electronics',
        category2: 'Usb / Cable',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price: '0.2'
    },
]

let totalPrice = 0;
BasketItems.forEach(item => {
    totalPrice += parseFloat(item.price)
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',(req,res)=>{
    res.render('index',{
        BasketItems,
        totalPrice
    });
})

app.post('/checkout',(req,res)=>{

    const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        price: totalPrice,
        paidPrice: totalPrice,
        currency: Iyzipay.CURRENCY.TRY,
        basketId: 'B67832',
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: 'http://localhost:3000/result',
        enabledInstallments: [2, 3, 6, 9],
        buyer: {
            id: 'BY789',
            name: req.body.firstName,
            surname: req.body.lastName,
            gsmNumber: '+905350000000',
            email: req.body.email,
            identityNumber: '74300864791',
            lastLoginDate: '2015-10-05 12:43:35',
            registrationDate: '2013-04-21 15:12:09',
            registrationAddress: req.body.address + req.body.address2,
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: req.body.firstName + req.body.lastName,
            city: 'Istanbul',
            country: 'Turkey',
            address: req.body.address + req.body.address2,
            zipCode: '34742'
        },
        billingAddress: {
            contactName: req.body.firstName + req.body.lastName,
            city: 'Istanbul',
            country: 'Turkey',
            address: req.body.address + req.body.address2,
            zipCode: '34742'
        },
        basketItems: BasketItems
    };

    iyzipay.checkoutFormInitialize.create(request,function (err,result){
        res.render('checkout',{form : result.checkoutFormContent})
        //console.log(result)
    })
})

app.post('/result',(req,res)=>{

    iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId: '123456789',
        token: req.body.token
    }, function (err, result) {
        const message = result.paymentStatus === 'SUCCESS' ? "Tebrikler Ödeme Başarılı" : "Hay Aksi! Bir şeyler ters gitti"
        res.render('result',{ message });
        //console.log(result)
    });
})

app.listen(3000,console.log("Server started on port 3000"))