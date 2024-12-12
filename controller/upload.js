const uuid = require("uuid");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

// api/v1/upload/image :: POST
exports.uploadImage = asyncHandler(async (req, res, next) => {
  const { image } = req.files;
  if (!image) throw new MyError("Зураг дамжуулна уу!", 404);
  const img = uuid.v4();
  const imgName = img + "." + image.name.split(".")[1];
  const imgPath = "./public/images/" + imgName;
  image.mv(imgPath);
  res.status(200).json({
    path: "/images/" + imgName,
  });
});
