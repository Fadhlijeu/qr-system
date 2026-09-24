import {useGetEvent} from "../../../../queries/useGetEvent.ts";
import {useNavigate, useParams} from "react-router";
import {PageTitle} from "../../../common/PageTitle";
import {PageBody} from "../../../common/PageBody";
import {useGetMe} from "../../../../queries/useGetMe.ts";
import {t, Trans} from "@lingui/macro";
import {useGetEventCheckInLists} from "../../../../queries/useGetCheckInLists.ts";
import {useGetCheckInListStatsPublic} from "../../../../queries/useGetCheckInListStatsPublic.ts";
import {useGetEventCounts} from "../../../../queries/useGetEventCounts.ts";
import {
    Skeleton,
    Button,
    SimpleGrid,
    Paper,
    Text,
    Group,
    Badge,
    ThemeIcon,
    Stack,
    Progress,
    Table,
    Card,
} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {
    IconQrcode,
    IconUsers,
    IconUserCheck,
    IconUserOff,
    IconChartBar,
    IconExternalLink,
    IconSettings,
    IconClock,
} from "@tabler/icons-react";
import {eventHomepageUrl} from "../../../../utilites/urlHelper.ts";

export const DashBoardSkeleton = () => {
    return (
        <>
            <Skeleton height={120} radius="md" mb="20px"/>
            <Skeleton height={140} radius="md" mb="20px"/>
            <Skeleton height={200} radius="md"/>
        </>
    );
};

export const EventDashboard = () => {
    const {eventId} = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width: 768px)');

    const {data: me} = useGetMe();
    const eventQuery = useGetEvent(eventId);
    const event = eventQuery?.data;

    const eventCountsQuery = useGetEventCounts(eventId);
    const eventCounts = eventCountsQuery?.data;

    const checkInListsQuery = useGetEventCheckInLists(eventId);
    const checkInLists = checkInListsQuery?.data?.data;
    const firstCheckInList = checkInLists?.[0];

    const checkInStatsQuery = useGetCheckInListStatsPublic(
        firstCheckInList?.short_id ?? '',
        !!firstCheckInList?.short_id
    );
    const checkInStats = checkInStatsQuery?.data?.data;

    // Calculate attendee numbers
    const totalRegisteredFromLists = checkInLists?.reduce(
        (acc, list) => acc + (list.total_attendees || 0),
        0
    ) ?? 0;
    const totalRegistered = checkInStats?.total_attendees
        ?? (totalRegisteredFromLists > 0 ? totalRegisteredFromLists : (eventCounts?.total_attendees_registered ?? 0));

    const totalCheckedIn = checkInStats?.checked_in_attendees
        ?? (checkInLists?.reduce((acc, list) => acc + (list.checked_in_attendees || 0), 0) ?? 0);

    const totalNotCheckedIn = Math.max(0, totalRegistered - totalCheckedIn);
    const attendancePctNumber = totalRegistered > 0 ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;
    const attendancePctString = totalRegistered > 0
        ? ((totalCheckedIn / totalRegistered) * 100).toFixed(1)
        : '0.0';

    const recentCheckIns = checkInStats?.recent_check_ins ?? [];

    const handleOpenScanner = () => {
        if (firstCheckInList?.short_id) {
            navigate(`/check-in/${firstCheckInList.short_id}`);
        } else {
            navigate(`/manage/event/${eventId}/check-in`);
        }
    };

    const publicUrl = event ? eventHomepageUrl(event) : '';

    return (
        <PageBody>
            {!isMobile && (
                <PageTitle style={{marginBottom: 0}}>
                    <Trans>
                        Selamat datang{me?.first_name && ', ' + me?.first_name} 👋
                    </Trans>
                </PageTitle>
            )}

            {!event && <DashBoardSkeleton/>}

            {event && (
                <>
                    {/* PRIMARY ACTION HERO CARD — SCAN QR */}
                    <Paper
                        radius="md"
                        p="xl"
                        mb="lg"
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                            color: 'white',
                            boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)',
                        }}
                    >
                        <Group justify="space-between" align="center" wrap="wrap" gap="md">
                            <Stack gap={4}>
                                <Text fw={700} size="xl" c="white">
                                    {event.title}
                                </Text>
                                <Text size="sm" c="white" opacity={0.85}>
                                    {t`Sistem Registrasi Tamu & Validasi QR Code`}
                                </Text>
                            </Stack>
                            <Group gap="sm">
                                {publicUrl && (
                                    <Button
                                        size="md"
                                        variant="white"
                                        color="gray"
                                        leftSection={<IconExternalLink size={18}/>}
                                        component="a"
                                        href={publicUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        styles={{
                                            root: {
                                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                                color: 'white',
                                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                                }
                                            }
                                        }}
                                    >
                                        {t`Buka Form Registrasi`}
                                    </Button>
                                )}
                                <Button
                                    size="md"
                                    variant="white"
                                    color="indigo"
                                    leftSection={<IconQrcode size={22}/>}
                                    onClick={handleOpenScanner}
                                    fw={700}
                                    styles={{
                                        root: {
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                                        }
                                    }}
                                >
                                    {t`Buka QR Scanner`}
                                </Button>
                            </Group>
                        </Group>
                    </Paper>

                    {/* ATTENDANCE METRICS */}
                    <Text fw={600} size="sm" c="dimmed" mb="sm" tt="uppercase" style={{letterSpacing: '0.05em'}}>
                        {t`Statistik Kehadiran Tamu`}
                    </Text>

                    <SimpleGrid cols={{base: 2, sm: 4}} mb="md">
                        {/* Total Registered */}
                        <Paper radius="md" p="lg" withBorder>
                            <Group gap="sm" mb="xs">
                                <ThemeIcon variant="light" color="blue" size="md" radius="md">
                                    <IconUsers size={18}/>
                                </ThemeIcon>
                                <Text size="xs" c="dimmed" fw={500}>{t`Total Terdaftar`}</Text>
                            </Group>
                            <Text fw={800} size="2.2rem" lh={1}>{totalRegistered.toLocaleString()}</Text>
                        </Paper>

                        {/* Checked In */}
                        <Paper radius="md" p="lg" withBorder>
                            <Group gap="sm" mb="xs">
                                <ThemeIcon variant="light" color="teal" size="md" radius="md">
                                    <IconUserCheck size={18}/>
                                </ThemeIcon>
                                <Text size="xs" c="dimmed" fw={500}>{t`Sudah Hadir (Check-in)`}</Text>
                            </Group>
                            <Text fw={800} size="2.2rem" lh={1} c="teal">{totalCheckedIn.toLocaleString()}</Text>
                        </Paper>

                        {/* Not Checked In */}
                        <Paper radius="md" p="lg" withBorder>
                            <Group gap="sm" mb="xs">
                                <ThemeIcon variant="light" color="orange" size="md" radius="md">
                                    <IconUserOff size={18}/>
                                </ThemeIcon>
                                <Text size="xs" c="dimmed" fw={500}>{t`Belum Hadir`}</Text>
                            </Group>
                            <Text fw={800} size="2.2rem" lh={1} c="orange">{totalNotCheckedIn.toLocaleString()}</Text>
                        </Paper>

                        {/* Attendance % */}
                        <Paper radius="md" p="lg" withBorder>
                            <Group gap="sm" mb="xs">
                                <ThemeIcon variant="light" color="violet" size="md" radius="md">
                                    <IconChartBar size={18}/>
                                </ThemeIcon>
                                <Text size="xs" c="dimmed" fw={500}>{t`Persentase Hadir`}</Text>
                            </Group>
                            <Group align="baseline" gap={4}>
                                <Text fw={800} size="2.2rem" lh={1} c="violet">{attendancePctString}</Text>
                                <Text fw={600} size="sm" c="violet">%</Text>
                            </Group>
                        </Paper>
                    </SimpleGrid>

                    {/* ATTENDANCE PROGRESS BAR */}
                    <Card radius="md" p="md" mb="lg" withBorder>
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={600}>{t`Progres Kehadiran Acara`}</Text>
                            <Badge color="violet" variant="light" size="lg">
                                {totalCheckedIn} / {totalRegistered} {t`Tamu`} ({attendancePctString}%)
                            </Badge>
                        </Group>
                        <Progress
                            value={attendancePctNumber}
                            size="xl"
                            radius="xl"
                            color="violet"
                            animated={totalCheckedIn > 0 && attendancePctNumber < 100}
                        />
                    </Card>

                    {/* RECENT CHECK-INS SECTION */}
                    {recentCheckIns.length > 0 && (
                        <Card radius="md" p="lg" mb="lg" withBorder>
                            <Group justify="space-between" mb="md">
                                <Group gap="xs">
                                    <ThemeIcon variant="light" color="teal" size="sm" radius="md">
                                        <IconClock size={16}/>
                                    </ThemeIcon>
                                    <Text fw={600} size="md">
                                        {t`Check-in Terkini`}
                                    </Text>
                                </Group>
                                <Badge color="teal" variant="light">
                                    {recentCheckIns.length} {t`terbaru`}
                                </Badge>
                            </Group>
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>{t`Nama Tamu`}</Table.Th>
                                        <Table.Th>{t`Tipe Tiket / Undangan`}</Table.Th>
                                        <Table.Th>{t`Waktu Check-in`}</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {recentCheckIns.slice(0, 5).map((scan, idx) => (
                                        <Table.Tr key={idx}>
                                            <Table.Td fw={600}>
                                                {scan.first_name} {scan.last_name}
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge size="sm" variant="outline">
                                                    {scan.product_title || t`Undangan`}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td c="dimmed" size="sm">
                                                {scan.checked_in_at ? new Date(scan.checked_in_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'}) : '-'}
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Card>
                    )}

                    {/* QUICK ACTIONS */}
                    <Text fw={600} size="sm" c="dimmed" mb="sm" tt="uppercase" style={{letterSpacing: '0.05em'}}>
                        {t`Menu Utama`}
                    </Text>
                    <SimpleGrid cols={{base: 1, sm: 3}} mb="lg">
                        <Button
                            variant="light"
                            color="blue"
                            size="md"
                            leftSection={<IconUsers size={20}/>}
                            onClick={() => navigate(`/manage/event/${eventId}/attendees`)}
                            justify="start"
                        >
                            {t`Lihat Daftar Peserta`}
                            {totalRegistered > 0 && (
                                <Badge ml="xs" size="sm" variant="filled" color="blue">
                                    {totalRegistered}
                                </Badge>
                            )}
                        </Button>

                        <Button
                            variant="light"
                            color="teal"
                            size="md"
                            leftSection={<IconQrcode size={20}/>}
                            onClick={handleOpenScanner}
                            justify="start"
                        >
                            {t`Buka QR Scanner`}
                        </Button>

                        <Button
                            variant="light"
                            color="gray"
                            size="md"
                            leftSection={<IconSettings size={20}/>}
                            onClick={() => navigate(`/manage/event/${eventId}/settings`)}
                            justify="start"
                        >
                            {t`Pengaturan Event`}
                        </Button>
                    </SimpleGrid>
                </>
            )}
        </PageBody>
    );
};

export default EventDashboard;
