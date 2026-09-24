import {Navigate, Outlet} from "react-router";
import classes from "./Auth.module.scss";
import {useGetMe} from "../../../queries/useGetMe.ts";
import {LanguageSwitcher} from "../../common/LanguageSwitcher";
import {useEffect} from "react";
import {captureUtmData} from "../../../utilites/utm.ts";

const AuthLayout = () => {
    const me = useGetMe();

    useEffect(() => {
        captureUtmData();
    }, []);

    if (me.isSuccess) {
        return <Navigate to={'/manage/events'} />;
    }

    return (
        <div className={classes.authLayout}>
            <main className={classes.container}>
                <div className={classes.headerArea}>
                    <div className={classes.logoIcon} aria-hidden="true">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" />
                            <circle cx="17.5" cy="17.5" r="2.5" />
                        </svg>
                    </div>
                </div>

                <div className={classes.formArea}>
                    <div className={classes.wrapper}>
                        <Outlet />
                    </div>
                </div>

                <div className={classes.panelFooter}>
                    <div className={classes.languageSwitcher}>
                        <LanguageSwitcher />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthLayout;
