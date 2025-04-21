'use client'

import React from 'react';
import { toast as toastify } from 'react-toastify';

// This is a simple wrapper around toast libraries to make them interchangeable
const toast = {
    success: (message: string) => toastify.success(message),
    error: (message: string) => toastify.error(message),
    info: (message: string) => toastify.info(message),
    warning: (message: string) => toastify.warning(message)
};

export default toast;