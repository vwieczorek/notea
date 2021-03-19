import { api } from 'libs/server/api'
import { useAuth } from 'libs/server/middlewares/auth'
import { useStore } from 'libs/server/middlewares/store'
import { getPathSettings } from 'libs/server/note-path'
import { formatSettings, Settings } from 'libs/shared/settings'
import { isEqual } from 'lodash'
import { tryJSON } from 'packages/shared'
import { StoreProvider } from 'packages/store/src'

export async function getSettings(store: StoreProvider) {
  const settings =
    tryJSON<Settings>(await store.getObject(getPathSettings())) || {}
  const formatted = formatSettings(settings)

  if (!isEqual(settings, formatted)) {
    await store.putObject(getPathSettings(), JSON.stringify(formatted))
    return formatted
  }
  return settings
}

export default api()
  .use(useAuth)
  .use(useStore)
  .post(async (req, res) => {
    const { body } = req
    const settings = formatSettings(body)

    await req.store.putObject(getPathSettings(), JSON.stringify(settings))

    res.json(settings)
  })
  .get(
    async (req, res): Promise<void> => {
      const settings = getSettings(req.store)

      res.json(settings)
    }
  )
