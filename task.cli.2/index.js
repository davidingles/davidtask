import { program } from 'commander'
import inquirer from 'inquirer'
import mongoose from 'mongoose'
import 'dotenv/config.js'
import preguntas from './inquirer.prompt.js'

const conexion = process.env.MONGODB_URI || 'mongodb://localhost:27017/tasks'

// conexion a la base de datos
function connectDB () {
  mongoose.connect(conexion)
  console.log('connected to db')
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
}
connectDB()

// esquema y modelo de la tarea
const tareaSchema = new mongoose.Schema(
  {
    tarea: { type: String, required: true },
    descripcion: { type: String, required: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

const Tarea = mongoose.model('Tarea', tareaSchema)

// add task
const addTask = async (tarea) => {
  const nuevaTarea = new Tarea(tarea)
  await nuevaTarea.save()
  console.log('Tarea guardada')
}
const listTasks = async () => {
  const tareas = await Tarea.find()
  console.table(tareas.map((tarea) => ({
    // _id: tarea._id.toString(),
    tarea: tarea.tarea,
    descripcion: tarea.descripcion
  })))
}


const findTask = async () => {
  const tareas = await Tarea.find()
  const choices = tareas.map((tarea, index) => ({
    name: `${tarea.tarea} - ${tarea.descripcion}`,
    value: index
  }))

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'taskIndex',
      message: 'Selecciona una tarea:',
      choices
    }
  ])

  const tarea = tareas[answer.taskIndex]
  console.table({
    _id: tarea._id.toString(),
    tarea: tarea.tarea,
    descripcion: tarea.descripcion
  })

  const action = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: '¿Qué quieres hacer?',
      choices: [
        { name: 'Editar', value: 'edit' },
        { name: 'Borrar', value: 'delete' },
        { name: 'Salir', value: 'exit' }
      ]
    }
  ])

  if (action.action === 'edit') {
    const newDescription = await inquirer.prompt([
      {
        type: 'input',
        name: 'descripcion',
        message: 'Ingresa la nueva descripción:',
        default: tarea.descripcion
      }
    ])

    tarea.descripcion = newDescription.descripcion
    await Tarea.updateOne({ _id: tarea._id }, tarea)
    console.log('Descripción actualizada')
  } else if (action.action === 'delete') {
    await Tarea.deleteOne({ _id: tarea._id })
    console.log('Tarea borrada')
  } else {
    console.log('Saliendo...')
  }
}
program.version('0.0.1').description('A CLI tool to manage tasks')

program.command('add').description('Add a new task').action(() => {
  inquirer
    .prompt(preguntas)
    .then((respuestas) => {
      addTask(respuestas)
      console.table(respuestas)
    })
})
program.command('list').description('List all tasks').action(() => {
  listTasks()
})
program.command('edit').description('Find a task by id').action(() => {
  findTask()
})

program.parse(process.argv)
