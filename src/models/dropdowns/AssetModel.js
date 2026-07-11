import BaseModel from '../BaseModel'

export default class AssetModel extends BaseModel {

    id = 0

    name = ''
    comment = ''

    product_number = ''

    picture_front = ''
    picture_rear = ''

    /** @type {string[]} */
    pictures = []

    date_creation = null
    date_mod = null
}