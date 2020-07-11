const express = require('express');
const dotenv = require('dotenv');
const bodyparser = require('body-parser');
const http = require("http");
const socketIO = require("socket.io");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const cron = require('node-cron');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');
const db = require("monk")('mongodb+srv://khmc:khmc12345@khmc-r3oxo.mongodb.net/test?retryWrites=true&w=majority');
dotenv.config({ path: './config/.env' });
connectDB();
// Route files
const auth = require('./routes/auth');
const item = require('./routes/item');
const vendor = require('./routes/vendor');
const buInventory = require('./routes/buInventory');
const fuInventory = require('./routes/fuInventory');
const buRepRequest = require('./routes/buRepRequest');
const functionalUnit = require('./routes/functionalUnit');
const buReturn = require('./routes/buReturn');
const businessUnit = require('./routes/businessUnit');
const buStockInLog = require('./routes/buStockInLog');
const buStockOutLog = require('./routes/buStockOutLog');
const buRepRequestDetails = require('./routes/buRepRequestDetails');
const systemAdmin = require('./routes/systemAdmin');
const staffType = require('./routes/staffType');
const staff = require('./routes/staff');
const warehousePRPO = require('./routes/warehousePRPO');
const warehousePODetails = require('./routes/wPODetails');
const warehouseInventory = require('./routes/warehouseInventory');
const warehouseInventoryLog = require('./routes/warehouseInventoryLog');
const purchaseRequest = require('./routes/purchaseRequest');
const purchaseOrder = require('./routes/purchaseOrder');
const receiveItem = require('./routes/receiveItem');
const receiveItemBU = require('./routes/receiveItemBU');
const receiveItemFU = require('./routes/receiveItemFU');
const materialReceiving = require('./routes/materialReceiving');
const shippingTerm = require('./routes/shippingTerm');
const accessLevel = require('./routes/accessLevel');
const account = require('./routes/account');
const replenishmentRequest = require('./routes/replenishmentRequest')
const replenishmentRequestBU = require('./routes/replenishmentRequestBU')
const internalReturnRequest = require('./routes/internalReturnRequest')
const externalReturnRequest = require('./routes/externalReturnRequest')
const subscriber = require('./routes/subscriber')
const patient = require('./routes/patient')
const insurance = require('./routes/insurance')
const app = express();
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cors());

// Auth routes
const { protect } = require('./middleware/auth');
app.use(protect);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/item', item);
app.use('/api/vendor', vendor);
app.use('/api/buinventory', buInventory);
app.use('/api/fuinventory', fuInventory);
app.use('/api/bureprequest', buRepRequest);
app.use('/api/functionalunit', functionalUnit);
app.use('/api/bureturn', buReturn);
app.use('/api/businessunit', businessUnit);
app.use('/api/bustockinlog', buStockInLog);
app.use('/api/bustockoutlog', buStockOutLog);
app.use('/api/bureprequestdetails', buRepRequestDetails);
app.use('/api/systemadmin', systemAdmin);
app.use('/api/accessLevel', systemAdmin);
app.use('/api/stafftype', staffType);
app.use('/api/staff', staff);
app.use('/api/warehouseprpo', warehousePRPO);
app.use('/api/warehousepodetails', warehousePODetails);
app.use('/api/warehouseinventory', warehouseInventory);
app.use('/api/warehouseinventorylog', warehouseInventoryLog);
app.use('/api/purchaserequest', purchaseRequest);
app.use('/api/purchaseorder', purchaseOrder);
app.use('/api/receiveitem', receiveItem);
app.use('/api/receiveitembu', receiveItemBU);
app.use('/api/receiveitemfu', receiveItemFU);
app.use('/api/materialreceiving', materialReceiving);
app.use('/api/shippingterm', shippingTerm);
app.use('/api/accesslevel', accessLevel);
app.use('/api/account', account);
app.use('/api/replenishmentRequest', replenishmentRequest);
app.use('/api/replenishmentRequestBU', replenishmentRequestBU);
app.use('/api/internalreturnrequest', internalReturnRequest);
app.use('/api/externalreturnrequest', externalReturnRequest);
app.use('/api/subscriber', subscriber);
app.use('/api/patient', patient);
app.use('/api/insurance', insurance);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
const port = 4001
app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
const serverSocket = http.createServer(app);
const io = socketIO(serverSocket);

io.on("connection", socket => {
  socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
const pRequest = db.get("purchaserequests");
const pOrder = db.get("purchaseorders");
var prArray =[];

// // cron.schedule('* * * * *', () => {

    //  pRequest.find({committeeStatus:'to_do',generated:'System'}).then(docs => {
    //   var temp = [];
    //   for (let i = 0; i<docs.length; i++)
    //   {
    //     temp.push(docs[i])
    //   }
    //   while(temp.length >0)
    //   {
    //     var c= [];
    //     var temp2 = temp[0]
    //     if(temp2)
    //     {
    //     c = temp.filter((i)=> i.vendorId.toString() === temp2.vendorId.toString())
    //   }
    //    if(c.length>0)
    //   {
    //     var abc =[];
    //            c.map(u=>{
    //       abc.push(u._id)
    //     })
    //     pOrder.insert({
    //     purchaseOrderNo: uuidv4(),
    //     purchaseRequestId:abc,
    //     generated:'System',
    //     generatedBy:'System',
    //     date:moment().toDate(),
    //     vendorId:c[0].vendorId,
    //     status: 'to_do',
    //     committeeStatus: 'to_do',
    //     })
    //      temp = temp.filter((i)=>i.vendorId.toString()!=c[0].vendorId.toString())
    //     }
    // }
    // });


  // Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
global.globalVariable = { io: io };
serverSocket.listen(port, () => console.log(`Socket is listening on port ${port}`));
