const ResumeModel = require("../Models/resume");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const { CohereClientV2 } = require("cohere-ai");

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY, // 🔑 Paste your API key here
});

exports.addResume = async (req, res) => {
  try {
    const { job_desc, user } = req.body;
    //  console.log(req.file);
    //  console.log(req.body);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read uploaded PDF
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(dataBuffer);

    // Prompt for Cohere
    const prompt = `
      You are a resume screening assistant.
      Compare the following resume text with the provided Job Description (JD) and give a match score (0-100) and feedback.

      Resume:
      ${pdfData.text}

      Job Description:
      ${job_desc}

      Return the score and a brief explanation in this format:
      Score:  "number as percentage string, e.g., '85%'",
      Reason: ...
    `;

    // ✅ Chat API instead of generate
    const response = await cohere.chat({
      model: "command-r-08-2024", // Cohere recommended model
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    // Cohere v2 response format
    let result = response.message.content[0].text.trim();

    //console.log("✅ AI Result:", result);
    const match = result.match(/Score:\s*"(\d+)%"/);
    const score = match ? match[1] + "%" : null;

    const reasonMatch = result.match(/Reason:\s*([\s\S]*)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : null;

    const newResume = new ResumeModel({
      user,
      resume_name: req.file.originalname,
      job_desc,
      score,
      feedback: reason,
    });
    await newResume.save();

    // Delete the uploaded file after processing
    fs.unlinkSync(pdfPath);

    // Send response

    res.json({
      message: "Resume processed successfully",
      data: newResume,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getAllResumesForUser = async (req, res) => {
  try {
    const { user } = req.params;
    let resumes = await ResumeModel.find({ user: user }).sort({
      createdAt: -1,
    }).populate("user");
    return res
      .status(200)
      .json({ message: "Your Previous History", resumes: resumes });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
};

exports.getResumeForAdmin = async (req, res) => {
  try {
    let resumes = await ResumeModel.find({})
      .sort({ createdAt: -1 })
      .populate("user");

    return res.status(200).json({
      message: "Fetched All History",
      resumes: resumes,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
};
