

const getPagination = (page,size) => {
    const limit = Number.parseInt(size) || 30;
    const Page = Number.parseInt(page) || 1;
    const offset = (Page - 1) * limit;
    return {limit, offset}
}

module.exports = { getPagination }