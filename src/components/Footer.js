const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 py-4 px-6 transition-colors duration-200">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {currentYear} JN Core ERP. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
