import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    applicantName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewed', 'Interviewing', 'Hired', 'Rejected'],
      default: 'Applied',
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;
