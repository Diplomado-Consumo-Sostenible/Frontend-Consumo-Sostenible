export const registerBusinessModel = (data) => {
    return {
        businessName: data.businessName,
        description: data.description,
        address: data.address,
        phone: data.phone,

        categoryId: Number(data.tipo_id),

        tagIds: Array.isArray(data.tags)
            ? data.tags.map(Number)
            : [],
    }
}
