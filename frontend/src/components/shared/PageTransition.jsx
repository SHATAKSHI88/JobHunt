import React from 'react'
import { motion } from 'framer-motion'

// A light fade + slide-up applied on every page mount. Since each route in
// this app's router renders a fresh component (no shared <Outlet/> layout),
// this "enter" animation on mount is what actually reads as a page
// transition to the user as they navigate.
const PageTransition = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
    >
        {children}
    </motion.div>
)

export default PageTransition
