# SPDX-License-Identifier: LicenseRef-FNCL-1.1
# Copyright (c) 2026 Cpt_Kirk
idf_component_register(
    SRCS "webui_dummy.c"
    INCLUDE_DIRS "."
)

# The WebUI is embedded gzipped. The three assets stay plain text in the repository,
# and a build step compresses them into the component build directory, which is what
# ends up in flash: about 122 kB instead of about 623 kB. main/api/http_server.c
# serves them with "Content-Encoding: gzip" to clients that advertise gzip support.
#
# CMAKE_BUILD_EARLY_EXPANSION is set while ESP-IDF pre-parses this file (cmake -P) only
# to collect the component requirements, and custom commands are not available there.
if(NOT CMAKE_BUILD_EARLY_EXPANSION)
    set(WEBUI_WWW_DIR "${CMAKE_CURRENT_SOURCE_DIR}/www")
    set(WEBUI_GZ_TOOL "${CMAKE_CURRENT_SOURCE_DIR}/tools/gzip_asset.py")
    set(WEBUI_GZ_DIR "${CMAKE_CURRENT_BINARY_DIR}/embed_gz")

    idf_build_get_property(python PYTHON)

    set(WEBUI_GZ_ASSETS "")
    foreach(webui_asset "index.html" "app.js" "styles.css" "remote_display.js")
        set(webui_src "${WEBUI_WWW_DIR}/${webui_asset}")
        set(webui_gz "${WEBUI_GZ_DIR}/${webui_asset}.gz")
        add_custom_command(
            OUTPUT "${webui_gz}"
            COMMAND "${python}" "${WEBUI_GZ_TOOL}" "${webui_src}" "${webui_gz}"
            DEPENDS "${webui_src}" "${WEBUI_GZ_TOOL}"
            COMMENT "Gzip WebUI asset ${webui_asset}"
            VERBATIM
        )
        list(APPEND WEBUI_GZ_ASSETS "${webui_gz}")
    endforeach()

    foreach(webui_gz IN LISTS WEBUI_GZ_ASSETS)
        target_add_binary_data(${COMPONENT_LIB} "${webui_gz}" BINARY)
    endforeach()
endif()
