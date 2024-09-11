import { ref } from "vue";

export function useDrilldowns(store) {
    const rowsExpandedMembers = ref([] as any[]);
    const rowsDrilldownMembers = ref([] as any[]);
    const columnsExpandedMembers = ref([] as any[]);
    const columnsDrilldownMembers = ref([] as any[]);

    const drilldownOnRows = (member) => {
        const expandedIndex = rowsExpandedMembers.value.findIndex(
            (e: any) => e.UName === member.UName,
        );

        if (expandedIndex >= 0)
            rowsExpandedMembers.value.splice(expandedIndex, 1);

        const sameHierarchyIndex = rowsDrilldownMembers.value.findIndex(
            (e: any) => {
                return e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME;
            },
        );

        if (member.LNum === "0") {
            rowsDrilldownMembers.value.splice(sameHierarchyIndex, 1);
        } else {
            if (sameHierarchyIndex >= 0) {
                rowsDrilldownMembers.value.splice(
                    sameHierarchyIndex,
                    1,
                    member,
                );
            } else {
                rowsDrilldownMembers.value.push(member);
            }
        }
    };

    const drilldownOnColumns = (member) => {
        const expandedIndex = columnsExpandedMembers.value.findIndex(
            (e: any) => e.UName === member.UName,
        );

        if (expandedIndex >= 0)
            columnsExpandedMembers.value.splice(expandedIndex, 1);

        const sameHierarchyIndex = columnsDrilldownMembers.value.findIndex(
            (e: any) => {
                return e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME;
            },
        );

        if (member.LNum === "0") {
            columnsDrilldownMembers.value.splice(sameHierarchyIndex, 1);
        } else {
            if (sameHierarchyIndex >= 0) {
                columnsDrilldownMembers.value.splice(
                    sameHierarchyIndex,
                    1,
                    member,
                );
            } else {
                columnsDrilldownMembers.value.push(member);
            }
        }
    };

    const drillupOnRows = async (member) => {
        const datasource = store.getDatasource();

        const levels = datasource.getLevels();

        const parentLevel = levels.find((e) => {
            return (
                e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME &&
                e.LEVEL_NUMBER ===
                    Math.max(parseInt(member.LNum) - 1, 0).toString()
            );
        });

        if (parentLevel) {
            const parentMember = await datasource.getMember(
                parentLevel,
                member.PARENT_UNIQUE_NAME,
            );

            const requestParentLevel = levels.find((e) => {
                return (
                    e.HIERARCHY_UNIQUE_NAME ===
                        parentMember.HIERARCHY_UNIQUE_NAME &&
                    e.LEVEL_NUMBER ===
                        Math.max(
                            parseInt(parentMember.LEVEL_NUMBER) - 1,
                            0,
                        ).toString()
                );
            });
            if (requestParentLevel) {
                const createdMember = {
                    UName: parentMember.PARENT_UNIQUE_NAME,
                    LName: requestParentLevel.LEVEL_UNIQUE_NAME,
                    HIERARCHY_UNIQUE_NAME:
                        requestParentLevel.HIERARCHY_UNIQUE_NAME,
                    LNum: requestParentLevel.LEVEL_NUMBER,
                };

                drilldownOnRows(createdMember);
            }
        }
    };

    const drillupOnColumns = async (member) => {
        const datasource = store.getDatasource();

        const levels = datasource.getLevels();

        const parentLevel = levels.find((e) => {
            return (
                e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME &&
                e.LEVEL_NUMBER ===
                    Math.max(parseInt(member.LNum) - 1, 0).toString()
            );
        });

        if (parentLevel) {
            const parentMember = await datasource.getMember(
                parentLevel,
                member.PARENT_UNIQUE_NAME,
            );

            const requestParentLevel = levels.find((e) => {
                return (
                    e.HIERARCHY_UNIQUE_NAME ===
                        parentMember.HIERARCHY_UNIQUE_NAME &&
                    e.LEVEL_NUMBER ===
                        Math.max(
                            parseInt(parentMember.LEVEL_NUMBER) - 1,
                            0,
                        ).toString()
                );
            });
            if (requestParentLevel) {
                const createdMember = {
                    UName: parentMember.PARENT_UNIQUE_NAME,
                    LName: requestParentLevel.LEVEL_UNIQUE_NAME,
                    HIERARCHY_UNIQUE_NAME:
                        requestParentLevel.HIERARCHY_UNIQUE_NAME,
                    LNum: requestParentLevel.LEVEL_NUMBER,
                };

                drilldownOnColumns(createdMember);
            }
        }
    };

    const expandOnRows = (member) => {
        console.log("expandOnRows", member);
        const currentMemberHierarchyItems: any[] =
            rowsExpandedMembers.value.filter((e: any) => {
                return e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME;
            });
        currentMemberHierarchyItems.push(member);
        currentMemberHierarchyItems.sort(
            (a, b) => parseInt(a.LNum) - parseInt(b.LNum),
        );
        const indexInSorted = currentMemberHierarchyItems.indexOf(member);
        if (indexInSorted === 0) {
            if (currentMemberHierarchyItems.length > 1) {
                const nextItemIndex = rowsExpandedMembers.value.findIndex(
                    (e) => e.UName === currentMemberHierarchyItems[1].UName,
                );
                rowsExpandedMembers.value.splice(nextItemIndex, 0, member);
            } else {
                rowsExpandedMembers.value.push(member);
            }
        } else {
            const prevItemIndex = rowsExpandedMembers.value.findIndex(
                (e) =>
                    e.UName ===
                    currentMemberHierarchyItems[indexInSorted - 1].UName,
            );
            rowsExpandedMembers.value.splice(prevItemIndex + 1, 0, member);
        }
    };

    const collapseOnRows = (member) => {
        const itemIndex = rowsExpandedMembers.value.findIndex((e: any) => {
            return e.UName === member.UName;
        });

        rowsExpandedMembers.value.splice(itemIndex, 1);
    };

    const expandOnColumns = (member) => {
        console.log("expandOnColumns", member);
        const currentMemberHierarchyItems: any[] =
            columnsExpandedMembers.value.filter((e: any) => {
                return e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME;
            });
        currentMemberHierarchyItems.push(member);
        currentMemberHierarchyItems.sort(
            (a, b) => parseInt(a.LNum) - parseInt(b.LNum),
        );
        const indexInSorted = currentMemberHierarchyItems.indexOf(member);
        if (indexInSorted === 0) {
            if (currentMemberHierarchyItems.length > 1) {
                const nextItemIndex = columnsExpandedMembers.value.findIndex(
                    (e) => e.UName === currentMemberHierarchyItems[1].UName,
                );
                columnsExpandedMembers.value.splice(nextItemIndex, 0, member);
            } else {
                columnsExpandedMembers.value.push(member);
            }
        } else {
            const prevItemIndex = columnsExpandedMembers.value.findIndex(
                (e) =>
                    e.UName ===
                    currentMemberHierarchyItems[indexInSorted - 1].UName,
            );
            columnsExpandedMembers.value.splice(prevItemIndex + 1, 0, member);
        }
    };

    const collapseOnColumns = (member) => {
        const itemIndex = columnsExpandedMembers.value.findIndex((e: any) => {
            return e.UName === member.UName;
        });

        columnsExpandedMembers.value.splice(itemIndex, 1);
    };

    const flushExpands = (columns, rows) => {
        const notUsedHierarchiesInDrilldownCols =
            columnsExpandedMembers.value.filter((e: any) => {
                return !columns.some((member) => {
                    return (
                        member.originalItem.HIERARCHY_UNIQUE_NAME ===
                        e.HIERARCHY_UNIQUE_NAME
                    );
                });
            });

        notUsedHierarchiesInDrilldownCols.forEach((member: any) => {
            const itemIndex = columnsExpandedMembers.value.findIndex(
                (e: any) => {
                    return (
                        e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME
                    );
                },
            );

            columnsExpandedMembers.value.splice(itemIndex, 1);
        });

        const notUsedHierarchiesInDrilldownRows =
            rowsExpandedMembers.value.filter((e: any) => {
                return !rows.some((member) => {
                    return (
                        member.originalItem.HIERARCHY_UNIQUE_NAME ===
                        e.HIERARCHY_UNIQUE_NAME
                    );
                });
            });

        notUsedHierarchiesInDrilldownRows.forEach((member: any) => {
            const itemIndex = rowsExpandedMembers.value.findIndex((e: any) => {
                return e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME;
            });

            rowsExpandedMembers.value.splice(itemIndex, 1);
        });
    };

    const flushDrilldowns = (columns, rows) => {
        const notUsedHierarchiesInDrilldownCols =
            columnsDrilldownMembers.value.filter((e: any) => {
                return !columns.some((member) => {
                    return (
                        member.originalItem.HIERARCHY_UNIQUE_NAME ===
                        e.HIERARCHY_UNIQUE_NAME
                    );
                });
            });

        notUsedHierarchiesInDrilldownCols.forEach((member: any) => {
            const itemIndex = columnsDrilldownMembers.value.findIndex(
                (e: any) => {
                    return (
                        e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME
                    );
                },
            );

            columnsDrilldownMembers.value.splice(itemIndex, 1);
        });

        const notUsedHierarchiesInDrilldownRows =
            rowsDrilldownMembers.value.filter((e: any) => {
                return !rows.some((member) => {
                    return (
                        member.originalItem.HIERARCHY_UNIQUE_NAME ===
                        e.HIERARCHY_UNIQUE_NAME
                    );
                });
            });

        notUsedHierarchiesInDrilldownRows.forEach((member: any) => {
            const itemIndex = rowsDrilldownMembers.value.findIndex((e: any) => {
                return e.HIERARCHY_UNIQUE_NAME === member.HIERARCHY_UNIQUE_NAME;
            });

            rowsDrilldownMembers.value.splice(itemIndex, 1);
        });
    };

    const handleDrilldownEvent = ({ value, area }) => {
        if (area === "rows") {
            drilldownOnRows(value);
        } else if (area === "columns") {
            drilldownOnColumns(value);
        }
    };

    const handleDrillupEvent = ({ value, area }) => {
        if (area === "rows") {
            drillupOnRows(value);
        } else if (area === "columns") {
            drillupOnColumns(value);
        }
    };

    const handleExpandEvent = ({ value, area }) => {
        if (area === "rows") {
            expandOnRows(value);
        } else if (area === "columns") {
            expandOnColumns(value);
        }
    };

    const handleCollapseEvent = ({ value, area }) => {
        if (area === "rows") {
            collapseOnRows(value);
        } else if (area === "columns") {
            collapseOnColumns(value);
        }
    };

    return {
        rowsExpandedMembers,
        rowsDrilldownMembers,
        columnsExpandedMembers,
        columnsDrilldownMembers,
        drilldownOnRows,
        drilldownOnColumns,
        drillupOnRows,
        drillupOnColumns,
        expandOnRows,
        collapseOnRows,
        expandOnColumns,
        collapseOnColumns,
        flushExpands,
        flushDrilldowns,
        handleDrilldownEvent,
        handleDrillupEvent,
        handleExpandEvent,
        handleCollapseEvent,
    };
}
