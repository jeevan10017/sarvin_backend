const mongoose = require('mongoose');
const slugify = require('slugify');
const crypto = require('crypto');
const Product = require('./models/Product');
require('dotenv').config({ path: './.env' });

/**
 * Generates a clean, unique slug.
 * It truncates the slug and removes any trailing hyphens before adding a unique suffix.
 * This prevents slugs like "my-product--a1b2c3d4".
 */
const generateUniqueSlug = (name) => {
  const baseSlug = slugify(name, { lower: true, strict: true });
  // The key improvement: truncate AND remove trailing hyphens
  const truncatedSlug = baseSlug.substring(0, 75).replace(/-+$/, '');
  const uniqueSuffix = crypto.randomBytes(4).toString('hex');
  return `${truncatedSlug}-${uniqueSuffix}`;
};

const regenerateAllSlugs = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI is not defined in your .env file!');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected.');

    // Find ALL products to ensure every slug is updated.
    const products = await Product.find({});
    if (products.length === 0) {
      console.log('No products found to update.');
      return;
    }

    console.log(`🔍 Found ${products.length} products. Regenerating all slugs...`);
    
    let updatedCount = 0;
    for (const product of products) {
      product.slug = generateUniqueSlug(product.name);
      await product.save();
      updatedCount++;
      console.log(`Updated slug for: ${product.name}`);
    }

    console.log(`\n🚀 Successfully regenerated slugs for ${updatedCount} products!`);

  } catch (error) {
    console.error('❌ An error occurred during migration:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Database disconnected.');
  }
};

// Run the script
regenerateAllSlugs();