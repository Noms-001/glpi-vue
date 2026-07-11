
export default class BaseModel {
    /**
     * @param {Record<string, any>[]} data
     * @returns {BaseModel[]}
     */
    static fromArray(data = []) {

        return data.map(item => {
            return Object.assign(new this() , item)
        })
    }
}