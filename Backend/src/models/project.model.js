// import mongoose from 'mongoose';

// const projectSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: [true, 'project name is required'],
//     },
//     code: {
//       type: String,
//       default: '',
//     },
//     review: {
//       type: String,
//       default: '',
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const projectModel = mongoose.model('project', projectSchema);
// export default projectModel;

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'project name is required'],
    },
    teamName: {
      type: String,
      required: true,
      lowercase: true,
    },
    code: {
      type: String,
      default: '',
    },
    review: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const projectModel = mongoose.model('Project', projectSchema);
export default projectModel;
