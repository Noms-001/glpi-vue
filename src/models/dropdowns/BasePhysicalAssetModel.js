import AssetModel from './AssetModel'

export default class BasePhysicalAssetModel extends AssetModel {

    weight = 0

    rack_units = 1

    depth = 1

    power_connections = 0
    power_consumption = 0

    is_half_rack = false

}