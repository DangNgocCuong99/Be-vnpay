import express from "express"
import handleApi from '../controller'
const Router = express.Router()
Router.get('/', handleApi )

export default Router