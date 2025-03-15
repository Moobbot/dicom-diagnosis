/* eslint-disable @next/next/no-img-element */

import React, { useContext } from 'react';
import { LayoutContext } from './context/layoutcontext';

const AppFooter = () => {
    const { layoutConfig } = useContext(LayoutContext);

    return (
        <div className="layout-footer">
            {/* <img src={`/layout/images/logo.svg`} alt="Logo" height="20" className="mr-2" /> */}
            <span className="mr-2">Copyright © 2024 </span> developed by <span className="font-medium ml-2">NewLife Team</span>
        </div>
    );
};

export default AppFooter;