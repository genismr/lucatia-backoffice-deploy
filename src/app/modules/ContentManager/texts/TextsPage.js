import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader } from '../../../../_metronic/_partials/controls'
import Table, { buttonsStyle, dateFormatter, substringFormatter } from '../../../components/tables/table'
import { getTexts } from '../../../../api/text'
import { Button, Tooltip } from '@material-ui/core'
import EditIcon from '@material-ui/icons/Edit'
import { alertError } from '../../../../utils/logger'
import { useHistory } from 'react-router-dom'
import { getNonEmpty } from '../../../../utils/helpers'

function getData(texts) {
  let data = []
  for (let i = 0; i < texts.length; ++i) {
      const elem = {}
      elem.title = getNonEmpty(texts[i].title)
      elem.content = getNonEmpty(texts[i].content)
      elem.createdAt = texts[i].createdAt
      elem.id = texts[i]._id
      data = data.concat(elem)
  }
  return data
}

export default function TextsPage() {
  const [data, setData] = useState([])
  const [refresh, setRefresh] = useState(false)
  const history = useHistory()

  function buttonFormatter(cell) {
    return (<>
      <Tooltip title="Edit">
        <Button
          style={buttonsStyle} size="small"
          onClick={() => history.push('/edit-text/' + cell)}>
          <EditIcon/>
        </Button>
      </Tooltip>
    </>)
  }

  const columns = [
    { dataField: 'title', text: 'Title', sort: true },
    { dataField: 'content', text: 'Content', sort: true, formatter: substringFormatter },
    {
			dataField: 'createdAt',
			text: 'Created at',
			formatter: dateFormatter,
			sort: true,
		},
    { dataField: 'id', text: '', formatter: buttonFormatter }
  ]

  useEffect(() => {
    getTexts().then((res) => {
      if (res.status === 200) {
        setData(getData(res.data))
        setRefresh(false)
      }
    }).catch(error => {
      alertError({ error: error, customMessage: 'Could not get texts.' })
    })
  }, [refresh])

  return (
    <>
      <Card>
        <CardHeader title='Texts list'>
        </CardHeader>
        <CardBody>
          <Table
            data={data}
            columns={columns}
          />
        </CardBody>
      </Card>
    </>
  );
}
