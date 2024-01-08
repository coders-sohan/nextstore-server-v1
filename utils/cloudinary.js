const cloudinary = require("cloudinary");

// config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// cloudinary image upload
const cloudinaryImageUpload = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      console.log(result);
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        {
          resource_type: "auto",
        }
      );
    });
  });
};

// cloudinary image delete
const cloudinaryImageDelete = async (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (result) => {
      if (result === undefined || result.result === "not found") {
        reject(new Error("Image not found or undefined"));
      } else {
        resolve(result);
      }
    });
  });
};

// export cloudinary function
module.exports = {
  cloudinaryImageUpload,
  cloudinaryImageDelete,
};
