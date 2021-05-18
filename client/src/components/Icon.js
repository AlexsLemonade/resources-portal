import React from 'react'
import { Blank } from 'grommet-icons'
import Archive from '../images/archive.svg'
import Check from '../images/check.svg'
import ChevronDown from '../images/chevron-down.svg'
import ChevronLeft from '../images/chevron-left.svg'
import ChevronRight from '../images/chevron-right.svg'
import ChevronUp from '../images/chevron-up.svg'
import ChevronsStacked from '../images/chevrons-stacked.svg'
import Cite from '../images/cite.svg'
import Cross from '../images/cross.svg'
import Deliver from '../images/deliver.svg'
import Details from '../images/details.svg'
import Dropdown from '../images/dropdown.svg'
import Edit from '../images/edit.svg'
import FilePDF from '../images/file-pdf.svg'
import Filter from '../images/filter.svg'
import Gear from '../images/gear.svg'
import Help from '../images/help.svg'
import Info from '../images/info.svg'
import LeaveTeam from '../images/leave-team.svg'
import MoreOptions from '../images/more-options.svg'
import MTA from '../images/mta.svg'
import Plus from '../images/plus.svg'
import Search from '../images/search.svg'
import TransferMember from '../images/transfer-member.svg'
import Trashcan from '../images/trash-can.svg'
import View from '../images/view.svg'
import Warning from '../images/warning.svg'
import Grant from '../images/grant-icon.svg'
import Organism from '../images/organism-icon.svg'
import ResourceType from '../images/resource-type-icon.svg'
import List from '../images/list.svg'
import Later from '../images/later.svg'
import ORCID from '../images/ORCID.svg'

export const SVGs = {
  Archive,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsStacked,
  Cite,
  Cross,
  Deliver,
  Details,
  Dropdown,
  Edit,
  FilePDF,
  Filter,
  Gear,
  Help,
  Info,
  LeaveTeam,
  MoreOptions,
  MTA,
  Plus,
  Search,
  TransferMember,
  Trashcan,
  View,
  Warning,
  Grant,
  Organism,
  ResourceType,
  List,
  Later,
  ORCID
}

export default ({ color = 'brand', size = 'medium', name }) => {
  const Icon = SVGs[name]
  return (
    <Blank color={color} size={size}>
      <Icon />
    </Blank>
  )
}
