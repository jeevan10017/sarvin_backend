// cleanup-collections.js

const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const cleanupCollectionField = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in your .env file!');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully.');

    const productsCollection = mongoose.connection.collection('products');

    // Step 1: Copy data from 'collection' to 'productCollection' for any documents that missed it.
    const copyResult = await productsCollection.updateMany(
      { collection: { $exists: true }, productCollection: { $exists: false } },
      [{ $set: { productCollection: '$collection' } }]
    );
    console.log(`✅ Step 1: Copied 'collection' to 'productCollection' for ${copyResult.modifiedCount} documents.`);

    // Step 2: Unset (delete) the old 'collection' field from all documents where it exists.
    const unsetResult = await productsCollection.updateMany(
      { collection: { $exists: true } },
      { $unset: { collection: "" } }
    );
    console.log(`🗑️ Step 2: Removed old 'collection' field from ${unsetResult.modifiedCount} documents.`);
    
    console.log('\n🚀 Migration finished! Your product data is now clean.');

  } catch (error) {
    console.error('❌ An error occurred during the migration:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Database disconnected.');
  }
};

cleanupCollectionField();