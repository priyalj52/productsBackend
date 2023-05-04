const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();
//to access uploads folder on frontend
app.use('/uploads', express.static('uploads'));

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//cors
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
  
// Connect to MongoDB
mongoose.connect('mongodb://localhost/product-api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//  product schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  imageUrl: String,
});

// Create the product model
const Product = mongoose.model('Product', productSchema);

// multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
    storage: storage
  });


//store data in DB and send to frontend
app.post('/api/products', upload.single('imageUrl'), async (req, res) => {
  const { name, price, description } = req.body;
  const imageUrl = req.file.path;
//   console.log(imageUrl)
  const product = new Product({ name, price, description, imageUrl });
  await product.save();
  res.json(product);
});



//Display data
  app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
  });
  


  //UPDATE Product with id from mongoDB of product
  app.put('/api/products/:id', upload.single('imageUrl'), async (req, res) => {
    try {
      const { name, price, description } = req.body;
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        imageUrl = req.file.path;
      }
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, { name, price, description, imageUrl }, { new: true });
      res.json(updatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });



  //delete the product using ID from mongoDB
  
  app.delete('/api/products/:id', async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      res.json(deletedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });
  

app.listen(8080, () => console.log('Server started on port 8080'));
