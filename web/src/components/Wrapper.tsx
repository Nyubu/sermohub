import { Box } from "@chakra-ui/react"
import React from 'react'

export type WrapperVariant = 'small' | 'regular';

interface WrapperProps {
    variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({ 
    children, 
    variant='regular' // default value
}) => {
    return (
        <Box 
            fontFamily="Poppins"
            mx="auto"
            mt={8} 
            maxW={ variant === 'regular' ? "1200px" : '400px'}
            w="100%"                        
            bgGradient="linear-gradient(
                to right bottom,
                rgba(255, 255, 255, 0.8),
                rgba(255, 255, 255, 0.8)
            )"
            padding={8}
            style={{ boxShadow: "6px 6px 20px rgba(122, 122, 122, 0.4)"}}
        >
            {/* Render children inside wrapper box */}
            {children} 
        </Box>
    )
}