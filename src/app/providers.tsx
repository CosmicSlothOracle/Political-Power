'use client'

import React from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import store from '../store/index'
import 'react-toastify/dist/ReactToastify.css'
import SocketInitializer from '../components/SocketInitializer'
import CardServiceInitializer from '../components/CardServiceInitializer'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Provider store={store}>
                <CardServiceInitializer />
                <SocketInitializer>
                    {children}
                </SocketInitializer>
                <ToastContainer
                    position="bottom-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </Provider>
        </>
    )
}