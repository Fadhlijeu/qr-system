import {
    IconArrowLeft,
    IconChevronRight,
    IconDashboard,
    IconExternalLink,
    IconEye,
    IconEyeOff,
    IconMailCheck,
    IconMailForward,
    IconQrcode,
    IconSettings,
    IconShare,
    IconUsers,
} from "@tabler/icons-react";
import {t} from "@lingui/macro";
import {useGetEvent} from "../../../queries/useGetEvent";
import {useGetEventSettings} from "../../../queries/useGetEventSettings";
import {useGetEventCounts} from "../../../queries/useGetEventCounts";
import {useGeoStatus} from "../../../queries/useGeoStatus.ts";
import Truncate from "../../common/Truncate";
import {BreadcrumbItem, NavItem} from "../AppLayout/types.ts";
import AppLayout from "../AppLayout";
import {NavLink, useLocation, useParams} from "react-router";
import classes from './Event.module.scss';
import {Button} from "@mantine/core";
import {confirmationDialog} from "../../../utilites/confirmationDialog.tsx";
import {useUpdateEventStatus} from "../../../mutations/useUpdateEventStatus.ts";
import {showError, showSuccess} from "../../../utilites/notifications.tsx";
import {ShareModal} from "../../modals/ShareModal";
import {EventLiveCelebrationModal} from "../../modals/EventLiveCelebrationModal";
import {PublishEventModal} from "../../modals/PublishEventModal";
import {useDisclosure} from "@mantine/hooks";
import {TopBarButton} from "../../common/TopBarButton";
import {useWindowWidth} from "../../../hooks/useWindowWidth.ts";
import {SidebarCallout} from "../../common/SidebarCallout";
import {useGetMe} from "../../../queries/useGetMe.ts";
import {useResendEmailConfirmation} from "../../../mutations/useResendEmailConfirmation.ts";
import {useMemo, useState} from "react";
import {eventHomepageUrl} from "../../../utilites/urlHelper.ts";
import {useGetEventOccurrence} from "../../../queries/useGetEventOccurrence.ts";
import {prettyDate} from "../../../utilites/dates.ts";

const EventLayout = () => {
    const location = useLocation();
    const {eventId} = useParams();

    const [opened, {open, close}] = useDisclosure(false);
    const [celebrationOpened, {open: openCelebration, close: closeCelebration}] = useDisclosure(false);
    const [publishModalOpened, {open: openPublishModal, close: closePublishModal}] = useDisclosure(false);

    const statusToggleMutation = useUpdateEventStatus();

    const {data: event, isFetched: isEventFetched} = useGetEvent(eventId);
    const {isFetched: isEventSettingsFetched} = useGetEventSettings(eventId);
    const {data: eventCounts} = useGetEventCounts(eventId);
    const {data: me} = useGetMe();

    const resendEmailConfirmationMutation = useResendEmailConfirmation();
    const [emailConfirmationResent, setEmailConfirmationResent] = useState(false);
    useGeoStatus();

    const occurrenceIdFromUrl = useMemo(() => {
        const match = location.pathname.match(/\/occurrences\/(\d+)$/);
        return match ? match[1] : undefined;
    }, [location.pathname]);
    const {data: occurrence} = useGetEventOccurrence(eventId, occurrenceIdFromUrl);

    const handleEmailConfirmationResend = () => {
        resendEmailConfirmationMutation.mutate({
            userId: me?.id
        }, {
            onSuccess: () => {
                showSuccess(t`Email confirmation resent successfully`);
                setEmailConfirmationResent(true);
            },
            onError: () => {
                showError(t`Something went wrong. Please try again.`);
            }
        })
    }

    const navItems: NavItem[] = [
        // BACK TO ORGANIZER
        {link: '/manage/organizer/' + event?.organizer?.id, label: t`Organizer Dashboard`, icon: IconArrowLeft},

        // CORE MENU
        {label: t`Event`},
        {link: 'dashboard', label: t`Dashboard`, icon: IconDashboard},
        {
            link: 'attendees',
            label: t`Peserta`,
            icon: IconUsers,
            badge: eventCounts?.total_attendees_registered,
        },
        {link: 'check-in', label: t`QR Scanner`, icon: IconQrcode},
        {link: 'settings', label: t`Pengaturan Event`, icon: IconSettings},
    ];
    const navItemsWithLoading = !isEventSettingsFetched || !isEventFetched
        ? navItems.map(item => item.link ? {...item, loading: true} : item)
        : navItems;

    const screenWidth = useWindowWidth();
    const breadcrumbItemsWidth = screenWidth > 1100 ? 60 : 23;

    const breadcrumbItems: BreadcrumbItem[] = isEventFetched ? [
        {
            link: `/manage/organizer/${event?.organizer?.id}`,
            content: <Truncate length={breadcrumbItemsWidth} text={event?.organizer?.name} showTooltip={false}/>
        },
        {
            link: `/manage/event/${event?.id}`,
            content: <Truncate length={breadcrumbItemsWidth} text={event?.title} showTooltip={false}/>
        },
        ...(occurrenceIdFromUrl && occurrence ? [{
            link: `/manage/event/${event?.id}/occurrences/${occurrenceIdFromUrl}`,
            content: <Truncate
                length={breadcrumbItemsWidth}
                text={prettyDate(occurrence.start_date, event?.timezone || 'UTC') + (occurrence.label ? ` (${occurrence.label})` : '')}
                showTooltip={false}
            />
        }] : []),
    ] : [
        {link: '#', content: '...'}
    ];

    const handleStatusToggle = () => {
        if (event?.status === 'PENDING_MANUAL_REVIEW') {
            showError(t`This event is pending manual review and cannot be published until the review is complete.`);
            return;
        }

        if (event?.status !== 'LIVE') {
            openPublishModal();
            return;
        }

        const message = t`Are you sure you want to make this event draft? This will make the event invisible to the public`;

        confirmationDialog(message, () => {
            statusToggleMutation.mutate({
                eventId,
                status: 'DRAFT'
            }, {
                onSuccess: () => {
                    showSuccess(t`Event status updated`);
                },
                onError: (error: any) => {
                    showError(error?.response?.data?.message || t`Event status update failed. Please try again later`);
                }
            });
        });
    };

    return (
        <AppLayout
            navItems={navItemsWithLoading}
            breadcrumbItems={breadcrumbItems}
            entityType="event"
            topBarContent={(
                <div className={classes.statusToggleContainer}>
                    {isEventFetched && (
                        <TopBarButton
                            onClick={handleStatusToggle}
                            data-testid="event-status-toggle"
                            size="sm"
                            leftSection={(event?.status === 'DRAFT' || event?.status === 'PENDING_MANUAL_REVIEW') ? <IconEyeOff size={16}/> : <IconEye size={16}/>}
                            rightSection={<IconChevronRight size={14}/>}
                        >
                            {event?.status === 'PENDING_MANUAL_REVIEW'
                                ? <span>{t`Pending Review`}</span>
                                : event?.status === 'DRAFT'
                                    ? <span>{t`Draft`} <span
                                        className={classes.statusAction}>{t`- Click to Publish`}</span></span>
                                    : <span>{t`Live`} <span
                                        className={classes.statusAction}>{t`- Click to Unpublish`}</span></span>
                            }
                        </TopBarButton>
                    )}
                </div>
            )}
            breadcrumbContentRight={(
                <div className={classes.shareButton}>
                    {event && (
                        <>
                            <Button
                                onClick={open}
                                variant="transparent"
                                leftSection={<IconShare size={16}/>}
                            >
                                {t`Share Event`}
                            </Button>

                            <ShareModal
                                url={eventHomepageUrl(event)}
                                title={event.title}
                                modalTitle={t`Share Event`}
                                opened={opened}
                                onClose={close}
                            />

                            <EventLiveCelebrationModal
                                opened={celebrationOpened}
                                onClose={closeCelebration}
                                url={eventHomepageUrl(event)}
                                eventTitle={event.title}
                                eventId={String(event.id)}
                            />

                            {publishModalOpened && (
                                <PublishEventModal
                                    opened={publishModalOpened}
                                    onClose={closePublishModal}
                                    event={event}
                                    onSuccess={() => {
                                        closePublishModal();
                                        openCelebration();
                                    }}
                                />
                            )}
                        </>
                    )}
                </div>
            )}
            actionGroupContent={(
                <Button
                    component={NavLink}
                    to={`/event/${eventId}/${event?.slug}`}
                    target={'_blank'}
                    variant={'transparent'}
                    leftSection={<IconExternalLink size={17}/>}
                    className={classes.eventPageButton}
                    title={t`Preview Event page`}
                >
                    <div className={classes.eventPageButtonText}>
                                <span className={classes.desktop}>
                                    {t`Preview Event page`}
                                </span>
                        <span className={classes.mobile}>
                                    {t`Event Page`}
                                </span>
                    </div>

                </Button>
            )}
            sidebarFooter={
                (me && !me.is_email_verified && !emailConfirmationResent ? (
                    <SidebarCallout
                        icon={<IconMailCheck size={20}/>}
                        heading={t`Verify your email`}
                        description={t`Confirm your email to access all features.`}
                        buttonIcon={<IconMailForward size={16}/>}
                        buttonText={t`Resend email`}
                        onClick={() => handleEmailConfirmationResend()}
                    />
                ) : null)
            }
        />
    );
};

export default EventLayout;
