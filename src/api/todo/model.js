import mongoose, { Schema } from 'mongoose'

const todoSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'completed',
      'pending'
  ],
    required: true,
    default: 'pending'
  },
  completed_at: {
    type: Date
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    virtuals: true,
    transform: (obj, ret) => { delete ret._id }
  }
})

todoSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      title: this.title,
      status: this.status,
      completed_at: this.completed_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  },
  handleStatusChange () {
    const todo = this
    if(todo.status === 'completed') {
      todo.completed_at = new Date()
    } else if(todo.status === 'pending') {
      delete todo.completed_at
    } else {
      return Promise.reject(new Error(`could not handle status ${todo.status}`))
    }
    return Promise.resolve(todo)
  }
}

todoSchema.pre('save', function(next) {
  const todo = this

  return todo.handleStatusChange()
  .then(() => next())
  .catch((err) => next(err))

})

const model = mongoose.model('Todo', todoSchema)

export const schema = model.schema
export default model
