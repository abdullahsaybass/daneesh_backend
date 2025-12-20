import mongoose from "mongoose";
import {Course , Lesson} from '../models/course.js'


export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order, contents = [] } = req.body;

    /* ---------- VALIDATIONS ---------- */

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    if (!title || !order) {
      return res.status(400).json({
        success: false,
        message: "Title and order are required"
      });
    }

    if (!Number.isInteger(order) || order < 1) {
      return res.status(400).json({
        success: false,
        message: "Order must be a positive integer"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    /* ---------- DUPLICATE TITLE + DESCRIPTION CHECK ---------- */

    const normalizedTitle = title.trim().toLowerCase();
    const normalizedDesc = description?.trim().toLowerCase() || "";

    const duplicateLesson = course.lessons.some(lesson =>
      lesson.title.trim().toLowerCase() === normalizedTitle &&
      (lesson.description?.trim().toLowerCase() || "") === normalizedDesc
    );

    if (duplicateLesson) {
      return res.status(409).json({
        success: false,
        message: "Lesson with same title and description already exists"
      });
    }

    /* ---------- DUPLICATE ORDER CHECK ---------- */

    const orderExists = course.lessons.some(
      lesson => lesson.order === order
    );

    if (orderExists) {
      return res.status(409).json({
        success: false,
        message: `Lesson with order ${order} already exists`
      });
    }

    /* ---------- ADD LESSON ---------- */

    course.lessons.push({
      title: title.trim(),
      description,
      contents,
      order,
      createdBy: req.user._id
    });

    /* ---------- SORT LESSONS ---------- */
    course.lessons.sort((a, b) => a.order - b.order);

    await course.save();

    return res.status(201).json({
      success: true,
      message: "Lesson added successfully",
      lessons: course.lessons
    });

  } catch (error) {
    console.error("CREATE LESSON ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create lesson"
    });
  }
};

// update and edit course

export const updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { title, description, contents, order } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or lesson ID"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    /* ---------- FIND LESSON INDEX ---------- */
    const lessonIndex = course.lessons.findIndex(
      lesson => lesson._id.toString() === lessonId
    );

    if (lessonIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    const lesson = course.lessons[lessonIndex];

    /* ---------- UPDATE FIELDS ---------- */
    if (title !== undefined) lesson.title = title.trim();
    if (description !== undefined) lesson.description = description;
    if (contents !== undefined) lesson.contents = contents;
    if (order !== undefined) lesson.order = order;

    /* ---------- SORT AGAIN IF ORDER CHANGED ---------- */
    if (order !== undefined) {
      course.lessons.sort((a, b) => a.order - b.order);
    }

    await course.save();

    return res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson
    });

  } catch (error) {
    console.error("UPDATE LESSON ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// delete lesson from course

export const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or lesson ID"
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const lessonExists = course.lessons.some(
      lesson => lesson._id.toString() === lessonId
    );

    if (!lessonExists) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found"
      });
    }

    /* ---------- REMOVE EMBEDDED LESSON ---------- */
    course.lessons.pull({ _id: lessonId });

    await course.save();

    return res.json({
      success: true,
      message: "Lesson deleted successfully"
    });

  } catch (error) {
    console.error("DELETE LESSON ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
// get all lessons of a course
export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID"
      });
    }

    const course = await Course.findById(courseId).select("title lessons");

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const lessons = course.lessons.sort((a, b) => a.order - b.order);

    res.status(200).json({
      success: true,
      courseTitle: course.title,
      count: lessons.length,
      lessons
    });

  } catch (error) {
    console.error("GET LESSONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons"
    });
  }
};


/* ---------- GET SINGLE LESSON OF A COURSE ---------- */
export const getSingleLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lessonId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid course or lesson ID"
      });
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    const lesson = course.lessons.find(
      l => l._id.toString() === lessonId.toString()
    );

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
        availableLessons: course.lessons.map(l => ({
          id: l._id,
          title: l.title
        }))
      });
    }

    return res.status(200).json({
      success: true,
      courseTitle: course.title,
      lesson
    });

  } catch (error) {
    console.error("GET SINGLE LESSON ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
