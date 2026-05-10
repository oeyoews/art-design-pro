/**
 * 离线图标加载器
 *
 * 用于在内网环境下支持 Iconify 图标的离线加载。
 * 通过预加载图标集数据，避免运行时从 CDN 获取图标。
 *
 * 使用方式：
 * 1. 安装所需图标集：pnpm add -D @iconify-json/[icon-set-name]
 * 2. 在此文件中导入并注册图标集
 * 3. 在组件中使用：<ArtSvgIcon icon="ri:home-line" />
 *
 * @module utils/ui/iconify-loader
 * @author Art Design Pro Team
 */

import { addCollection } from '@iconify/vue'

import fluentIcons from '@iconify-json/fluent/icons.json'
import iconParkOutlineIcons from '@iconify-json/icon-park-outline/icons.json'
import iconamoonIcons from '@iconify-json/iconamoon/icons.json'
import ixIcons from '@iconify-json/ix/icons.json'
import riIcons from '@iconify-json/ri/icons.json'
import solarIcons from '@iconify-json/solar/icons.json'
import systemUiconsIcons from '@iconify-json/system-uicons/icons.json'
import vaadinIcons from '@iconify-json/vaadin/icons.json'

addCollection(riIcons)
addCollection(fluentIcons)
addCollection(iconamoonIcons)
addCollection(systemUiconsIcons)
addCollection(vaadinIcons)
addCollection(solarIcons)
addCollection(iconParkOutlineIcons)
addCollection(ixIcons)
