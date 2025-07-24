export const getFileIcon = (extension) => {
  const icons = {
    pdf: 'file-pdf',
    docx: 'file-word',
    xlsx: 'file-excel',
    // 其他文件类型映射
  };
  return icons[extension] || 'file-alt';
};