const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema(
	{		
		id:Number,
		title: String,
		image: String
	},
	{
		collection:"tbl_category",
		timestamps:{
			createdAt: "created_date",
			updatedAt: "updated_date"
		}
	}	
)

const CategorySchema = mongoose.model("tbl_category", categorySchema)
module.exports = CategorySchema;