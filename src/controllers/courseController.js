import mongoose from "mongoose";
import { Course } from "../models/course.js";

/* ================= CHECK COURSE EXISTS ================= */
export const checkCourseExists = async (req, res) => {
  try {
    const { title, code } = req.query;

    if (!title && !code) {
      return res.status(400).json({
        success: false,
        message: "Provide either title or code to check"
      });
    }

    const query = {};
    if (title) query.title = title.trim();
    if (code) query.code = code.trim().toUpperCase();

    const course = await Course.findOne(query);

    return res.json({
      success: true,
      exists: !!course,
      course: course
        ? { id: course._id, title: course.title, code: course.code }
        : null
    });

  } catch (error) {
    console.error("CHECK COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* ================= CREATE COURSE ================= */
export const createCourse = async (req, res) => {
  try {
    const {
      title,
      code,
      subtitle,
      description,
      language,
      level,
      category,
      subCategory,
      thumbnail,
      promoVideoVimeoId,
      whatYouWillLearn,
      requirements
    } = req.body;

    if (!title || !code) {
      return res.status(400).json({
        success: false,
        message: "Title and code required"
      });
    }

    const courseTitle = title.trim();
    const courseCode = code.trim().toUpperCase();

    const existing = await Course.findOne({
      $or: [{ title: courseTitle }, { code: courseCode }]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Course with same title or code already exists"
      });
    }

    const course = await Course.create({
      title: courseTitle,
      code: courseCode,
      subtitle,
      description,
      language,
      level,
      category,
      subCategory,
      thumbnail,
      promoVideoVimeoId,
      whatYouWillLearn,
      requirements,
      isDraft: true,
      isPublished: false,
      isActive: true,
      createdBy: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course
    });

  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* ================= UPDATE COURSE ================= */
export const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const allowedFields = [
      "title",
      "code",
      "subtitle",
      "description",
      "language",
      "level",
      "category",
      "subCategory",
      "thumbnail",
      "promoVideoVimeoId",
      "whatYouWillLearn",
      "requirements",
      "isDraft",
      "isPublished",
      "isActive"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === "title") {
          course.title = req.body.title.trim();
        } else if (field === "code") {
          course.code = req.body.code.trim().toUpperCase();
        } else {
          course[field] = req.body[field];
        }
      }
    }

    if (req.body.title || req.body.code) {
      const exists = await Course.findOne({
        $or: [
          req.body.title
            ? { title: req.body.title.trim() }
            : null,
          req.body.code
            ? { code: req.body.code.trim().toUpperCase() }
            : null
        ].filter(Boolean),
        _id: { $ne: course._id }
      });

      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Title or code already exists"
        });
      }
    }

    await course.save();

    return res.json({
      success: true,
      message: "Course updated successfully",
      course
    });

  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ================= DELETE COURSE ================= */
export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    await course.deleteOne();

    return res.json({
      success: true,
      message: "Course deleted successfully"
    });

  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

/* ================= GET ALL COURSES ================= */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });

  } catch (error) {
    console.error("GET ALL COURSES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses"
    });
  }
};

/* ================= GET COURSE BY ID ================= */
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(courseId).select("-__v");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // sort lessons
    course.lessons.sort((a, b) => a.order - b.order);

    res.status(200).json({
      success: true,
      course
    });

  } catch (error) {
    console.error("GET COURSE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course"
    });
  }
};
