const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT_LOCAL || 8888;
const UserRouter = require("./routes/UserRouter");
const ProductRouter = require("./routes/ProductRouter");
const Cloudinary = require("./routes/Cloudinary");
const cloudinary = require("cloudinary");
const OrderRouter = require("./routes/OrderRouter");
const PaymentRouter = require("./routes/PaymentRouter");
const SearchRouter = require("./routes/SearchRouter");
const main = require("./openAi/openAi");
const training = require("./openAi/openAi");
cloudinary.config({
  cloud_name: "dxtz2g7ga",
  api_key: "953156321132996",
  api_secret: "As23z_TAML8DqymuQA5Mw-KIk14",
});

// Bảo mật trình duyệt web tránh truy cập domain khác nhau sẽ bị lỗi cors
app.use(cors());
app.use(express.json({ limit: "100mb" })); // Tăng giới hạn lên 100MB cho JSON
app.use(express.urlencoded({ limit: "100mb" })); // Tăng giới hạn lên 100MB cho URL encoded data
// Bodyparser dat trước router
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());

UserRouter(app);
ProductRouter(app);
Cloudinary(app);
OrderRouter(app);
PaymentRouter(app);
SearchRouter(app);
mongoose
  .connect(process.env.MONGODB)
  .then(() => {
    console.log("Connect database successfully!!");
  })
  .catch((err) => {
    console.log("Connect database error!!", err);
    console.log("MONGO!!", port);
  });

const multer = require("multer");
// Cấu hình multer để lưu file vào thư mục uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "recording_" + Date.now() + ".webm");
  },
});
// Khởi tạo multer middleware
const upload = multer({ storage: storage });

// Xử lý yêu cầu POST tới endpoint '/upload' với multer middleware
app.post("/upload", upload.single("audio"), (req, res) => {
  console.log(req.file);
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  // Lưu dữ liệu ghi âm vào file
  const fileName = req.file.filename;
  return res.status(200).send("Upload successful. File name: " + fileName);
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
const fs = require("fs");
const fetch = require("node-fetch");
const { OpenAI, Configuration } = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPEN_API_KEY,
});

const uploadOpenAi = async () => {
  const res = await openai.files.create({
    // file: fs.createReadStream('data.jsonl')
    file: fs.createReadStream("traning2.jsonl"),
    purpose: "fine-tune",
  });
  console.log(res);
};
// uploadOpenAi();

// 2 List File
const listFiles = async () => {
  const res = await openai.files.list();
  console.log(res);
};
// listFiles()
// 3. Create fineTurning
const fineTune = async () => {
  const res = await openai.fineTuning.jobs.create({
    training_file: "file-p1RyhWPtkSGLFwR1DtMNl6At",
    model: "gpt-3.5-turbo",
  });
  console.log(res);
};
// fineTune();
const retrieve = async () => {
  // retrieve()
  const res = await openai.fineTuning.jobs.retrieve(
    "ftjob-Y3rR9u0vYK3M8F5NOUuXUhk0"
  );
  console.log("retrieve", res);
};
// retrieve()

// async function questionAI(message) {
//     const completion = await openai.chat.completions.create({
//         messages: [{ role: "assistant", content: message }],
//         model: "ft:gpt-3.5-turbo-0125:personal::90O54Foe",
//     });

//     console.log(completion.choices[0].message.content);
// }
const runAssistant = async () => {
  const assistant = await openai.beta.assistants.create({
    name: "Sneaker Asia",
    instructions: "Xin chào tôi là trợ lý chat cho shop Sneaker Asia!",
    tools: [{ type: "code_interpreter" }],
    model: "gpt-4-1106-preview",
  });
  const thread = await openai.beta.threads.create();
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: "Shop bạn có bán những gì?",
  });
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
    instructions:
      "Bạn đang trong vai là một chat box trả lời các câu hỏi về website của Sneaker Asia và dữ liệu tôi đã training cho bạn rồi, các câu hỏi về shop bạn phải biết cách trả lời.Địa chỉ của shop",
  });
  const checkStatusAndPrintMessage = async (threadID, runId) => {
    let runStatus = await openai.beta.threads.runs.retrieve(threadID, runId);
    console.log("check", runStatus);
    if (runStatus.status === "completed") {
      let message = await openai.beta.threads.messages.list(threadID);
      message.data.forEach((item) => {
        const role = item.role;
        const content = item.content[0].text.value;
        console.log(
          `${role.charAt(0).toUpperCase() + role.slice(1)} : ${content}`
        );
      });
    } else {
      console.log("not completed");
    }
  };
  setTimeout(() => {
    checkStatusAndPrintMessage(thread.id, run.id);
  }, 8000);
};
// runAssistant()
const { dockStart } = require("@nlpjs/basic");
const { searchForSimilarImage } = require("../searchImage");
(async () => {
  const dock = await dockStart({ use: ["Basic"] });
  const nlp = dock.get("nlp");

  nlp.addLanguage("vi");
  // Adds the utterances and intents for the NLP
  nlp.addDocument("vi", "Xin chào !", "greetings.hello");
  nlp.addDocument("vi", "Bạn là gì ", "greetings.who");
  nlp.addDocument("vi", "Bạn là ai ", "greetings.who");
  nlp.addDocument("vi", "Hello", "greetings.hello");
  nlp.addDocument(
    "vi",
    "Cửa hàng có bán giày sneaker nào của Adidas không?",
    "greetings.adidas"
  );
  nlp.addDocument(
    "vi",
    "Tôi có thể tìm thấy các mẫu giày Nike mới nhất ở đâu?",
    "greetings.nike"
  );
  nlp.addDocument(
    "vi",
    "Có mẫu giày Air Jordan nào đang giảm giá không?",
    "greetings.discount"
  );
  nlp.addDocument("vi", "Địa chỉ của shop bạn ở đâu ", "greetings.address");
  nlp.addDocument("vi", "Địa chỉ của shop ", "greetings.address");
  nlp.addDocument("vi", "Địa chỉ", "greetings.address");
  nlp.addDocument(
    "vi",
    "Làm sao để biết tôi đã đặt hàng thành công ở Sneaker Asia ?",
    "greetings.hello"
  );
  nlp.addDocument("vi", "Các số đo của sản phẩm bên bạn?", "greetings.size");
  nlp.addDocument(
    "vi",
    "Làm thế nào để theo dõi đơn hàng của tôi tại Sneaker Asia  ?",
    "greetings.follow"
  );
  nlp.addDocument(
    "vi",
    "Chính sách bảo hành bên shop bạn ?",
    "greetings.baohanh"
  );
  nlp.addDocument(
    "vi",
    "Tôi cao 1m60 đến 1m65 nặng 55-60kg thì mặc size nào ?",
    "greetings.tuVanSize"
  );
  nlp.addDocument(
    "vi",
    "Tôi cao 1m70 nặng 60kg thì mặc áo size nào?",
    "greetings.tuVanSize2"
  );
  nlp.addDocument(
    "vi",
    "Áo bên shop bạn có giá từ bao nhiêu",
    "greetings.price"
  );
  nlp.addDocument(
    "vi",
    "Làm sao để đặt hàng và biết đã đặt hàng thành công ?",
    "greetings.order"
  );
  nlp.addDocument(
    "vi",
    "Tôi mua nhiều thì sẽ có ưu đãi gì không ?",
    "greetings.freeship"
  );

  // Train also the NLG
  nlp.addAnswer(
    "vi",
    "greetings.hello",
    "Chào bạn, tôi có thể giúp gì được cho bạn, tôi là nhân viên của Sneaker Asia !"
  );
  nlp.addAnswer(
    "vi",
    "greetings.adidas",
    "Có nhé , hiện chúng tôi có vài mẫu adidas bạn có thể tham khảo trên website!"
  );
  nlp.addAnswer(
    "vi",
    "greetings.nike",
    "Bạn hãy vào thanh tìm kiếm và search thử nike xem sao nhé !"
  );
  nlp.addAnswer(
    "vi",
    "greetings.discount",
    "Bạn hãy click vào giảm giá và xem thử nhé!"
  );
  nlp.addAnswer(
    "vi",
    "greetings.size",
    "Đối với áo , quần thì size sẽ là S M L XL . Đối với nón thì sẽ có size 1 và size 2 . Đối với balo thì sẽ là 1 size duy nhất!"
  );
  nlp.addAnswer(
    "vi",
    "greetings.address",
    "Hiện shop chỉ bán online nên chưa có địa chỉ offline , bạn hãy thông cảm nhé !"
  );
  nlp.addAnswer(
    "vi",
    "greetings.freeship",
    "Có nhé , nếu bạn mua trên 500k sẽ được free ship . Và 10k ship khi mua từ 200k - 500k , 30k ship khi dưới 200k nhé!"
  );
  nlp.addAnswer(
    "vi",
    "greetings.follow",
    "Bạn có thể theo dõi đơn hàng của bạn trong phần đơn hàng của tôi và sẽ có trạng thái đơn hàng của bạn tại Sneaker Asia"
  );
  nlp.addAnswer(
    "vi",
    "greetings.baohanh",
    "Chính sách bên mình là 1 đổi 1 khi sản phẩm bị lỗi trong vòng 3 ngày sẽ được đổi lại nhưng phải còn đầy đủ tag nhé!"
  );
  nlp.addAnswer(
    "vi",
    "greetings.tuVanSize",
    "Tôi khuyến khích bạn nên chọn size S tại Sneaker Asia "
  );
  nlp.addAnswer(
    "vi",
    "greetings.tuVanSize2",
    "Đối với áo thì tôi khuyến khích bạn nên mang size XL nếu muốn rộng và L nếu muốn vừa tại Sneaker Asia "
  );
  nlp.addAnswer(
    "vi",
    "greetings.price",
    "Hiện áo bên shop tôi thì áo thun sẽ có giá từ 450k trở lên và áo sweater sẽ có giá từ 650k trở lên"
  );
  nlp.addAnswer(
    "vi",
    "greetings.order",
    "Trước tiên bạn sẽ cần phải đăng nhập / đăng ký (nếu chưa có tài khoản) . Sau đó bạn sẽ click vào sản phẩm bạn muốn mua và click thêm vào giỏ hàng , đi tiếp đến thanh toán và thanh toán. Sau khi thanh toán sẽ có email gửi về xác nhận cho bạn, bạn có thể theo dõi đơn hàng trong mục đơn hàng của tôi ."
  );
  nlp.addAnswer(
    "vi",
    "greetings.who",
    "Tôi là  trợ lý của Sneaker Asia , tôi sẽ giải đáp các thắc mắc của bạn !"
  );
  // await nlp.train();
  // const response = await nlp.process("vi", "Bạn là ai");
  // console.log(response.answers);
})();
